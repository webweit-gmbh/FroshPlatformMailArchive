<?php

declare(strict_types=1);

namespace Frosh\MailArchive\Decorator;

use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mailer\Transport\Transports;

/**
 * The original shopware class does not have an interface or abstract class, and
 * an existing decorator in SwagCommercial only defines a class with the same methods
 *
 * This decorator is defined as broadly as possible to be compatible with whatever methods
 * the decorated service has
 *
 * We check if any of the called methods return a transport. If one is returned, we try to find
 * the internally decorated transport (if one exists) and make sure it has the event dispatcher
 * set.
 *
 * Registration is handled in services.xml: the decoration targets the SwagCommercial decorator
 * service and uses decoration-on-invalid="ignore", so this decorator is silently dropped on
 * installations that do not have SwagCommercial. The class is therefore always declared (no
 * conditional class_exists wrapper), which keeps the service-container prototype autodiscovery
 * from failing to boot on non-commercial installations.
 */
class MailerTransportLoaderDecorator
{
    public function __construct(
        private object $decorated,
        private EventDispatcherInterface $eventDispatcher,
    ) {
    }

    /**
     * @param mixed[] $arguments
     */
    public function __call(string $name, array $arguments): mixed
    {
        $result = $this->decorated->$name(...$arguments);

        // Transports have an internal list of transports that are not accessible by default
        if ($result instanceof Transports) {
            $transportArray = (new \ReflectionProperty(Transports::class, 'transports'))->getValue($result);
            if (!\is_array($transportArray)) {
                return $result;
            }

            foreach ($transportArray as $transport) {
                $this->setNestedDispatcherProperty($transport);
            }

            return $result;
        }

        if ($result instanceof TransportInterface) {
            $this->setNestedDispatcherProperty($result);
        }

        return $result;
    }

    private function setNestedDispatcherProperty(mixed $object): void
    {
        if (!\is_object($object)) {
            return;
        }

        if ($object instanceof AbstractTransport) {
            $dispatcherProperty = new \ReflectionProperty(AbstractTransport::class, 'dispatcher');
            if ($dispatcherProperty->getValue($object)) {
                return;
            }

            $dispatcherProperty->setValue($object, $this->eventDispatcher);

            return;
        }

        // Check if any of the properties are a transport (i.e. the service is a decorator around a transport)
        $reflection = new \ReflectionClass($object);
        foreach ($reflection->getProperties() as $property) {
            $type = $property->getType();
            if (!$type instanceof \ReflectionNamedType) {
                continue;
            }

            $typeName = $type->getName();
            if ($typeName === TransportInterface::class) {
                $transport = $property->getValue($object);
                $this->setNestedDispatcherProperty($transport);

                return;
            }
        }
    }
}
