<template lang="pug">
    div(:key="key")
        v-form(v-model="valid")
            v-switch(v-model="valid" class="ma-4" label="Valid" readonly)
            div(v-for="modelParams in modelCollection[modelName]" data-jest="form-element")
                component(:is="`rf${modelParams.type}`" :required="modelParams.required" :label="modelParams.label" :regex="modelParams.regex" :name="modelParams.name" :model="modelName" @updateData="updateData($event)")
            div(v-for="modelParams in modelCollection.meta" data-jest="form-element")
                component(:is="`rf${modelParams.type}`" :model-params="modelParams" @updateData="updateData($event)")
            v-btn(@click="sendForm") Submit
</template>
<script>
import axios from "axios";
import rfBoolean from "./partials/model/edit/_booleanSwitch.vue";
import rfText from "./partials/model/edit/_textLine.vue";
import rfRichText from "./partials/model/edit/_richText.vue";
import rfCategoryFilter from "./partials/model/edit/_categoryFilter.vue";

import {mapActions, mapGetters} from "vuex";

export default {
    name: "model",
    data: function () {
        return {
            valid: true,
            currentModelData: {},
            key: true
        };
    },
    props: {modelName: String},
    components: {rfBoolean, rfText, rfRichText, rfCategoryFilter},
    methods: {
        ...mapActions(["addAlert"]),
        updateData(data) {
            this.$set(this.currentModelData, data.name, data.value);
        },
        sendForm() {
            this.$nextTick(() => {
                axios
                    .post(`/api/${this.settings.applicationName}/${encodeURI(this.modelName)}`, this.currentModelData)
                    .then(() => {
                        this.addAlert({
                            type: "success",
                            text: "Saved successfully"
                        });
                        this.$emit("reloadData");
                        this.key = !this.key;
                    }).catch(errors => {
                    this.addAlert({
                            type: "error",
                            text: `Request failed.  Returned status of ${errors}`
                        }
                    );
                });
            });
        }
    },
    computed: {
        ...mapGetters(["modelCollection", "settings"])
    },
    watch: {
        modelCollection() {
            this.currentModelData = this.modelCollection[this.modelName];
        }
    }
};

</script>

<style scoped>

</style>
