import './page/sw-customer-detail';
import './page/frosh-mail-archive-customer-detail';

Shopware.Module.register('frosh-mail-archive-customer-detail', {
    routeMiddleware(next, currentRoute) {
        if ('sw.customer.detail' === currentRoute.name) {
            currentRoute.children.push({
                name: 'frosh-mail-archive.customer.detail.mail-archive',
                path: '/sw/customer/detail/:id/mail-archive',
                component: 'frosh-mail-archive-customer-detail',
                meta: {
                    parentPath: 'sw.customer.index',
                    privilege: 'frosh_mail_archive:read',
                },
            });
        }

        next(currentRoute);
    },
});
