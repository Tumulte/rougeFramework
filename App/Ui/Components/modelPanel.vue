<template lang="pug">
    div
        //TODO add proper class for "selected"
        //TODO allow adding field to existing model
        .create-model-container
            v-text-field(v-if="!currentModelName" v-model="modelNameInput" data-jest="model-name" lapel="New model name" )
            v-btn(v-if="displayNewModelButton" data-jest="add-model" @click="createNewModel" :disabled="!modelNameInput || !modelNameIsUnique") Add new model

        .current-model-elements(v-for="(model,index) in modelCollection")
            v-card(class="pa-3 my-3" outlined :class="{'elevation-6':(index === currentEditModelName)}" v-if="noEdition(index)")
                v-card-title
                    h2 {{index}}
                        v-btn(v-if="currentEditModelName !== index && !currentModelName" @click="currentEditModelName = index" outlined class="mx-2") Edit
                        v-btn(v-else @click="cancelEditModel" outlined class="mx-2") Cancel
                            div(class="model-preview" v-if="currentModelName")
                .model-type
                    .select-container(v-if="index === currentEditModelName || modelNameInput")
                        select(data-jest="select-input" v-model="selectedFieldType" )
                            option(value="none") Select…
                            option(v-for="(type, index) in fieldType" :value="index") {{type.name}}
                component( v-if="selectedFieldType !== 'none'" :is="fieldType[selectedFieldType].component" edit=true :ref="selectedFieldType" @addFieldData="addFieldToModel($event)")
                div(v-if="index === currentEditModelName")
                    v-card-text
                        div(v-if="index === currentEditModelName" v-for="(field, subIndex) in model")
                            v-btn(v-if="currentMovingField !== null &&  subIndex < currentMovingField" @click="moveField(subIndex)" data-jest='move-field-destination' outlined color="primary") Move here
                            v-card(outlined class="pa-1 my-2"  :loading="subIndex === currentMovingField")
                                component(:is="fieldType[field.type].component" :fieldData="field" @deletField="deleteField(subIndex)" :ref="field.type" @updateEditedFieldData="saveEditedField($event,subIndex)")
                                div(class="d-flex justify-end")
                                    v-btn(class="mr-3 mt-3" data-jest='move-field' @click="moveField(subIndex)" v-if="model.length > 1 && subIndex !== currentMovingField" color="primary" outlined) Move
                                    v-btn(data-jest='delete-button' @click="deleteField(subIndex)" color="error" text class="mr-3 mt-3" ) Delete
                            v-btn(v-if="currentMovingField !== null && subIndex > currentMovingField" @click="moveField(subIndex)"  data-jest='move-field-destination' outlined color="primary") Move here
                    v-card-actions(class="justify-end")
                        v-btn(@click="deleteModel" color="error" text v-if="currentEditModelName !== 'meta'") Delete
                        v-btn(@click="saveModel" color="success" data-jest="saveStyleSet model") Save
        //todo add delete
        //todo test whole process
</template>
<script>
import textField from "./partials/model/panelEdit/_text.vue";
import booleanField from "./partials/model/panelEdit/_booleanSwitchEdit.vue";
import arrayMove from "array-move";
import richText from "./partials/model/panelEdit/_richText.vue";
import multiChoice from "./partials/model/panelEdit/_multiChoiceEdit.vue";
import categoryFilter from "./partials/model/panelEdit/_categoryFilterEdit.vue";

import {mapGetters} from "vuex";

export default {
    data: function () {
        return {
            modelNameInput: "",
            valid: true,
            displayNewModelButton: true,
            currentEditModelName: null,
            selectedFieldType: "none",
            currentModelName: "",
            currentMovingField: null,
            metaFieldType: {
                "CategoryFilter": {name: "Category", options: [], component: categoryFilter}
            },
            standardFieldType:
                {
                    "Boolean": {name: "Boolean", component: booleanField},
                    "Text": {name: "Text", component: textField},
                    "RichText": {name: "Rich Text Editor", component: richText},
                    "MultiChoice": {name: "Multiple Choices", component: multiChoice}
                }
        };
    },
    components: {categoryFilter},
    methods: {
        moveField(index) {
            if (this.currentMovingField === null) {
                this.currentMovingField = index;
            } else {
                let selectedModel = this.currentModelName ? this.currentModelName : this.currentEditModelName;
                this.modelCollection[selectedModel] = arrayMove(this.modelCollection[selectedModel], this.currentMovingField, index);
                this.$store.commit("modelCollection", this.modelCollection);
                this.currentMovingField = null;
            }
        },
        async cancelEditModel() {
            if (this.currentModelName) {
                await this.$store.dispatch("awaitConfirmation", {
                    text: "Are you sure you want to abandon the creation of this new model ?",
                    type: "warning"
                });
                await this.$store.dispatch("removeKeyFromCollection", {
                    collection: "modelCollection",
                    key: this.modelNameInput,
                });
                this.modelNameInput = "";
                this.currentModelName = null;
                this.displayNewModelButton = true;
            }
            this.currentEditModelName = null;
        },
        deleteField(index) {
            this.modelCollection[this.currentModelName].splice(index, 1);
            this.$store.commit("modelCollection", this.modelCollection);
        },
        addFieldToModel(event) {
            let model = "";
            if (this.currentModelName) {
                model = this.currentModelName;
            } else {
                model = this.currentEditModelName;
            }
            this.modelCollection[model].push(event);
            this.$store.commit("modelCollection", this.modelCollection);
            this.selectedFieldType = "none";
            this.currentEditModelName = this.currentModelName;
        },
        saveEditedField(event, index) {
            this.modelCollection[this.currentModelName][index] = event;
            this.$store.commit("modelCollection", this.modelCollection);
        },
        createNewModel() {
            this.$store.dispatch("addKeyToCollection", {
                collection: "modelCollection",
                key: this.modelNameInput,
                value: []
            });
            this.currentModelName = this.modelNameInput;
            this.displayNewModelButton = false;
        },
        async deleteModel() {
            await this.$store.dispatch("awaitConfirmation", {
                text: `Are you sure you want to delete this model :  ${this.currentEditModelName}?`,
                type: "error"
            });
            await this.$store.dispatch("removeKeyFromCollection", {
                collection: "modelCollection",
                key: this.currentEditModelName,
            });
            await this.$nextTick();
            document.getElementById("_admin-form-ext-submit").click();
        },
        saveModel: async function () {
            this.$store.commit("newModelName", this.modelNameInput);
            await this.$nextTick();
            document.getElementById("_admin-form-ext-submit").click();
        },
        noEdition: function (index) {
            return !this.currentModelName || index === this.currentModelName;
        }
    },
    computed: {
        ...mapGetters(["modelCollection"]),
        modelNameIsUnique() {
            return Object.keys(this.modelCollection).filter(item => item === this.modelNameInput).length === 0;
        },
        fieldType() {
            if (this.currentEditModelName === "meta") return this.metaFieldType;
            return this.standardFieldType;
        }

    }

};

</script>
<style scoped>
select {
    padding: 10px;
    width: 100%;

}

.select-container {
    border: 1px solid black;
    position: relative;
    border-radius: 5px;
    width: 70%;
    background: #fefefe;
}

.select-container::after {
    content: "\25BC";
    pointer-events: none;
    position: absolute;
    right: 20px;
    top: 10px;
    color: #555;
}


</style>
