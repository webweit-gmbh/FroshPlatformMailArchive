import template from './sw-customer-detail.html.twig';

Shopware.Component.override('sw-customer-detail', {
    template,

    computed: {
        froshArchiveMailsRoute() {
            return {
                name: 'frosh-mail-archive.customer.detail.mail-archive',
                params: { id: this.customerId },
            };
        },
    },
});
