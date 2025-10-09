import template from './frosh-mail-transport-state.html.twig';

Shopware.Component.register('frosh-mail-transport-state', {
    template,

    props: {
        transportState: {
            required: true,
            type: String,
        },
    },

    methods: {
        translateState(state) {
            return this.$tc(`frosh-mail-archive.state.${state}`);
        },
    },
});
