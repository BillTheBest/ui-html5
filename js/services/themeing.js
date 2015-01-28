manywho.themeing = (function (manywho, $) {

    var themes = null;

    return {
        
        initialize: function () {

            $.get(manywho.settings.get('themesUri'))
                .done(function(data) {
                    
                    log.info('Loaded ' + data.themes.length + ' themes')
                    themes = data.themes;

                })
                .fail(function() {
                    
                    log.error("Failed to load themes from: ");

                })
            
        },

        apply: function (name) {

            if (themes != null) {

                var theme = themes.filter(function (item) {
                    return item.name.toLowerCase() == name.toLowerCase();
                })[0];

                if (theme) {

                    log.info("Switching theme to: " + name);
                    // Show loading indicator here

                    var url = 'https:' + theme.cssCdn;
                    var link = document.getElementById('theme');
                    var img = document.createElement('img');

                    link.setAttribute('href', url);
                    
                    img.onerror = function () {
                       
                        log.info('Finished loading theme: ' + name);
                        // Hide loading indicator here

                    }
                    img.src = url;

                }
                else {

                    log.error(name + ' theme cannot be found');

                }

            }
            
        }

    }

})(manywho, jQuery);