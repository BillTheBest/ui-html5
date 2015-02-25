manywho.component = (function (manywho) {

    var components = {};

    function getComponentType(item) {

        if ('containerType' in item) {
            return item.containerType;
        }
        else if ('componentType' in item) {
            return item.componentType;
        }
        return null;

    }

    return {

        contentTypes: {
            string: 'CONTENTSTRING',
            number: 'CONTENTNUMBER',
            boolean: 'CONTENTBOOLEAN',
            password: 'CONTENTPASSWORD'
        },

        register: function (name, component) {

            components[name.toLowerCase()] = component;

        },

        get: function(item) {

            return components[getComponentType(item).toLowerCase()];

        },
        
        getByName: function (name) {

            return components[name.toLowerCase()];

        },

        getChildComponents: function (children, id, flowKey) {

            return children.map(function (item) {

                var component = this.get(item);                
                return React.createElement(component, { id: item.id, parentId: id, flowKey: flowKey, key: item.id });

            }, this);

        },

        getOutcomes: function(outcomes, flowKey)
        {

            return outcomes.map(function (item) {
                return React.createElement(components['outcome'], { id: item.id, flowKey: flowKey, key: item.id });
            });

        },

        handleEvent: function (component, model, flowKey) {

            if (model.hasEvents) {
                manywho.engine.sync(flowKey);
                manywho.collaboration.sync(manywho.state.getState().id);
            }

            component.forceUpdate();

        },

        getSelectedOptions: function (model, selectedOptions) {

            var selectedObjectData = null;

            if (selectedOptions) {

                for (option in selectedOptions) {

                    if (!manywho.utils.isNullOrWhitespace(selectedOptions[option].value)) {

                        selectedObjectData = model.objectData.filter(function (item) {

                            return manywho.utils.isEqual(item.externalId, selectedOptions[option].value, true);

                        })
                        .map(function (item) {

                            item.isSelected = true;
                            return item;

                        });

                    }

                }

            }

            return selectedObjectData;
        },

        getSelectedRows: function (model, selectedIds) {

            var selectedObjectData = null;

            if (selectedIds) {

                for (selectedId in selectedIds) {

                    if (!manywho.utils.isNullOrWhitespace(selectedIds[selectedId])) {

                        selectedObjectData = model.objectData.filter(function (item) {

                            return manywho.utils.isEqual(item.externalId, selectedIds[selectedId], true);

                        })
                        .map(function (item) {

                            item.isSelected = true;
                            return item;

                        });

                    }

                }

            }

            return selectedObjectData;
        },

        getDisplayColumns: function (columns) {

            // TODO: This should error if no display columns are found
            var displayColumns = null;

            if (columns) {

                displayColumns = columns.filter(function (column) {

                    return column.isDisplayValue;

                });

            }

            return displayColumns;

        },

        appendFlowContainer: function (flowKey) {

            var container = document.getElementById(flowKey);

            if (!container) {

                container = document.createElement('div');
                container.setAttribute('id', flowKey);
                container.className = 'mw-bs';
                document.body.appendChild(container);

            }

            return container;

        }

    }

}(manywho));
