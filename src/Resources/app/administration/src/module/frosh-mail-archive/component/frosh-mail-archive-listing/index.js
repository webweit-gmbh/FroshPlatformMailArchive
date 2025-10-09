const { Component, Mixin } = Shopware;

import template from './frosh-mail-archive-listing.html.twig';

Component.register('frosh-mail-archive-listing', {
    template,

    inject: ['repositoryFactory', 'froshMailArchiveService'],
    mixins: [Mixin.getByName('notification')],

    emits: ['open-detail', 'refresh-items', 'page-change', 'column-sort'],

    props: {
        items: {
            type: Object,
            required: true,
        },

        isLoading: {
            type: Boolean,
            required: false,
        },

        sortBy: {
            type: String,
            required: false,
            default: null,
        },

        sortDirection: {
            type: String,
            required: false,
            default: 'ASC',
        },
    },

    data() {
        return {
            selectedItems: {},
        };
    },

    computed: {
        froshMailArchiveRepository() {
            return this.repositoryFactory.create('frosh_mail_archive');
        },

        columns() {
            return [
                {
                    property: 'createdAt',
                    dataIndex: 'createdAt',
                    label: 'frosh-mail-archive.list.columns.sentDate',
                    primary: true,
                    routerLink: 'frosh.mail.archive.detail',
                },
                {
                    property: 'transportState',
                    dataIndex: 'transportState',
                    label: 'frosh-mail-archive.list.columns.transportState',
                    allowResize: true,
                },
                {
                    property: 'subject',
                    dataIndex: 'subject',
                    label: 'frosh-mail-archive.list.columns.subject',
                    allowResize: true,
                    routerLink: 'frosh.mail.archive.detail',
                },
                {
                    property: 'receiver',
                    dataIndex: 'receiver',
                    label: 'frosh-mail-archive.list.columns.receiver',
                    allowResize: true,
                },
            ];
        },

        date() {
            return Shopware.Filter.getByName('date');
        },

        transportStateOptions() {
            return [
                {
                    value: 'failed',
                    label: this.translateState('failed'),
                },
                {
                    value: 'sent',
                    label: this.translateState('sent'),
                },
                {
                    value: 'pending',
                    label: this.translateState('pending'),
                },
                {
                    value: 'resent',
                    label: this.translateState('resent'),
                },
            ];
        },
    },

    methods: {
        translateState(state) {
            return this.$tc(`frosh-mail-archive.state.${state}`);
        },

        onBulkResendClick() {
            const ids = Object.keys(this.selectedItems);
            if (ids.length === 0) {
                return;
            }

            Promise.all(
                ids.map((id) => {
                    return this.froshMailArchiveService.resendMail(id);
                })
            )
                .then(async () => {
                    this.createNotificationSuccess({
                        title: this.$tc(
                            'frosh-mail-archive.detail.resend-success-notification.title'
                        ),
                        message: this.$tc(
                            'frosh-mail-archive.detail.resend-success-notification.message'
                        ),
                    });
                    this.refreshItems();
                })
                .catch(() => {
                    this.createNotificationError({
                        title: this.$tc(
                            'frosh-mail-archive.detail.resend-error-notification.title'
                        ),
                        message: this.$tc(
                            'frosh-mail-archive.detail.resend-error-notification.message'
                        ),
                    });
                })
                .finally(async () => {
                    this.refreshItems();
                    this.resetSelection();
                });
        },

        resendMail(item) {
            this.froshMailArchiveService
                .resendMail(item.id)
                .then(async () => {
                    this.createNotificationSuccess({
                        title: this.$tc(
                            'frosh-mail-archive.detail.resend-success-notification.title'
                        ),
                        message: this.$tc(
                            'frosh-mail-archive.detail.resend-success-notification.message'
                        ),
                    });
                    this.refreshItems();
                })
                .catch(() => {
                    this.createNotificationError({
                        title: this.$tc(
                            'frosh-mail-archive.detail.resend-error-notification.title'
                        ),
                        message: this.$tc(
                            'frosh-mail-archive.detail.resend-error-notification.message'
                        ),
                    });
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        onSelectionChanged(selection) {
            this.selectedItems = selection;
        },

        resetSelection() {
            this.$refs.table?.resetSelection();
        },

        refreshItems() {
            this.$emit('refresh-items');
        },

        openDetail(item) {
            this.$emit('open-detail', item);
        },

        onSortColumn(opts) {
            this.$emit('column-sort', opts);
        },

        onPageChange(opts) {
            this.$emit('page-change', opts);
        },
    },

    watch: {
        isLoading: {
            handler: function () {
                this.resetSelection();
            },
        },
    },
});
