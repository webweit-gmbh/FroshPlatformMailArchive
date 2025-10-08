const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

import template from './frosh-mail-archive-customer-detail.html.twig';
import './frosh-mail-archive-customer-detail.scss';

Component.register('frosh-mail-archive-customer-detail', {
    template,

    inject: ['repositoryFactory', 'filterFactory'],

    mixins: [Mixin.getByName('listing')],

    props: {
        customer: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            items: null,
            sortBy: 'createdAt',
            sortDirection: 'DESC',
            filterCriteria: [],
            isLoading: true,
            storeKey: 'frosh-mail-archive-customer-listing',
            defaultFilters: ['transport-state-filter'],
        };
    },

    computed: {
        defaultCriteria() {
            const defaultCriteria = new Criteria(this.page, this.limit);
            defaultCriteria.setTerm(this.term);
            defaultCriteria.addSorting(
                Criteria.sort(this.sortBy, this.sortDirection)
            );

            defaultCriteria.addFilter(
                Criteria.equals('customerId', this.customer.id)
            );

            this.filterCriteria.forEach((filter) => {
                defaultCriteria.addFilter(filter);
            });

            return defaultCriteria;
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

        listFilters() {
            return this.filterFactory.create('frosh_mail_archive', {
                'transport-state-filter': {
                    property: 'transportState',
                    criteriaFilterType: 'equalsAny',
                    type: 'multi-select-filter',
                    label: this.$tc(
                        'frosh-mail-archive.list.sidebar.filters.transportStateLabel'
                    ),
                    placeholder: this.$tc(
                        'frosh-mail-archive.list.sidebar.filters.transportStatePlaceholder'
                    ),
                    options: this.transportStateOptions,
                },
            });
        },
    },

    methods: {
        translateState(state) {
            return this.$tc(`frosh-mail-archive.state.${state}`);
        },

        froshMailArchiveRepository() {
            return this.repositoryFactory.create('frosh_mail_archive');
        },

        async getList() {
            this.isLoading = true;

            const criteria = await Shopware.Service(
                'filterService'
            ).mergeWithStoredFilters(this.storeKey, this.defaultCriteria);

            try {
                const items =
                    await this.froshMailArchiveRepository().search(criteria);

                this.total = items.total;
                this.items = items;
                this.isLoading = false;
            } catch {
                this.isLoading = false;
            }
        },

        updateCriteria(criteria) {
            this.page = 1;
            this.filterCriteria = criteria;
        },

        onRefresh() {
            // force update of the filter criteria
            this.filterCriteria = this.filterCriteria.slice();
        },

        openDetail(item) {
            this.$router.push({
                name: 'frosh.mail.archive.detail',
                params: { id: item.id },
            });
        },
    },

    watch: {
        defaultCriteria: {
            handler() {
                this.getList();
            },
            deep: true,
        },
    },
});
