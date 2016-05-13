/*!
 Copyright 2016 ManyWho, Inc.
 Licensed under the ManyWho License, Version 1.0 (the "License"); you may not use this
 file except in compliance with the License.
 You may obtain a copy of the License at: http://manywho.com/sharedsource
 Unless required by applicable law or agreed to in writing, software distributed under
 the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language governing
 permissions and limitations under the License.
 */

manywho.connection = (function (manywho) {

    var onlineOverride = {
        isOnline: false,
        override: false,
        dataSyncRequired: false
    }

    function logError(error) {

        manywho.log.error(error);

    }

    function beforeSend(xhr, tenantId, authenticationToken, event, request) {

        xhr.setRequestHeader('ManyWhoTenant', tenantId);

        if (authenticationToken) {
            xhr.setRequestHeader('Authorization', authenticationToken);
        }

        if (manywho.settings.event(event + '.beforeSend')) {
            manywho.settings.event(event + '.beforeSend').call(this, xhr, request);
        }

    }

    function getOfflineDeferred(resolveContext, event, urlPart, request) {

        var deferred = new jQuery.Deferred();

        manywho.offline.setRequest(event, urlPart, request).then(function () {

            manywho.offline.getResponse(event, urlPart, request).then(function(response) {

                if (response == null) {
                    manywho.log.error('A response could not be found for request.');
                }

                // Resolve the deferred
                deferred.resolveWith(resolveContext, [response]);

            });

        });

        // Send the deferred object back ready to be resolved
        return deferred
            .done(manywho.settings.event(event + '.done'))
            .fail(logError)
            .fail(manywho.settings.event(event + '.fail'));
    }

    function getOnlineDeferred(event, urlPart, methodType, tenantId, stateId, authenticationToken, request) {

        var json = null;

        if (request != null) {
            json = JSON.stringify(request);
        }

        return $.ajax({
                url: manywho.settings.global('platform.uri') + urlPart,
                type: methodType,
                dataType: 'json',
                contentType: 'application/json',
                processData: true,
                data: json,
                beforeSend: function (xhr) {

                    manywho.offline.setRequest(event, urlPart, request);

                    beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);

                    if (manywho.utils.isNullOrWhitespace(stateId) == false) {
                        xhr.setRequestHeader('ManyWhoState', stateId);
                    }

                }
            })
            .done(function (response) {

                manywho.offline.setResponse(event, urlPart, request, response);

            })
            .done(manywho.settings.event(event + '.done'))
            .fail(logError)
            .fail(manywho.settings.event(event + '.fail'));

    }

    function getOnlineStatusFromDevice() {

        if (manywho.settings.global('offline.isCordova')) {
            return getOnlineStatusFromCordova();
        }

        manywho.log.info('Getting device online status using navigator.');
        if (navigator.onLine == false) {

            manywho.log.info('Device is offline.');
            return false;

        }

        manywho.log.info('Device is online.');
        return true;

    }

    function getOnlineStatusFromCordova() {

        manywho.log.info('Getting device online status using Cordova.');
        var networkState = navigator.connection.type;

        if (manywho.utils.isEqual(networkState, Connection.UNKNOWN, true) ||
            manywho.utils.isEqual(networkState, Connection.NONE, true) ||
            manywho.utils.isEqual(networkState, Connection.CELL, true)) {

            manywho.log.info('Device is offline.');
            return false;

        }

        manywho.log.info('Device is online.');
        return true;

    }

    function getOnlineStatus(stateId) {

        var onlineStatus = {};

        onlineStatus.online = onlineOverride.isOnline;
        onlineStatus.dataSyncRequired = onlineOverride.dataSyncRequired;
        onlineStatus.override = onlineOverride.override;

        if (onlineOverride.override == false) {

            if (manywho.utils.isEqual(stateId, manywho.recording.emptyStateId, true) == true) {

                onlineStatus.dataSyncRequired = true;

            }

            onlineStatus.online = getOnlineStatusFromDevice();

            return onlineStatus;

        }

        return onlineStatus;

    }

    return {

        setOnlineOverride: function(override) {

            onlineOverride = override;

        },

        isOnline: function(stateId) {

            return getOnlineStatus(stateId);

        },

        onError: function(xhr, status, error) {

            logError(error);

        },

        getDeferred: function(resolveContext, event, urlPart, methodType, tenantId, stateId, authenticationToken, requestObject) {

            // Check to see if the engine is running offline
            if (manywho.settings.global('offline.isEnabled') &&
                this.isOnline(stateId).online == false ||
                this.isOnline(stateId).dataSyncRequired == true) {

                // Send back the offline deferred as we don't have a connection
                return getOfflineDeferred(resolveContext, event, urlPart, requestObject);

            } else {

                // Send back the online deferred as we do have a connection
                return getOnlineDeferred(event, urlPart, methodType, tenantId, stateId, authenticationToken, requestObject);

            }

        }

    }

})(manywho);