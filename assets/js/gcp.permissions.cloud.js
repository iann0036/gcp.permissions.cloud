// gcp.permissions.cloud Core Functionality

var arn_template_state = "Processed";
function swapARN() {
    $('#arn-template-state').html(arn_template_state);
    if (arn_template_state == "Processed") {
        $('.original-arn-template').attr('style', '');
        $('.processed-arn-template').attr('style', 'display: none;');
        arn_template_state = "Original";
    } else {
        $('.original-arn-template').attr('style', 'display: none;');
        $('.processed-arn-template').attr('style', '');
        arn_template_state = "Processed";
    }
}

function readable_date(str) {
    if (!str) {
        return "-";
    }

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    let date = new Date(str);
    
    return '<span data-toggle="tooltip" data-placement="top" title="' + str + '">' + date.getDate() + ' ' + months[date.getMonth()] + ', ' + date.getFullYear() + '</span>';
}

function get_permission_level(name) {
    if (name.match(/\.(?:list|search|query|search)[a-zA-Z0-9]*$/g)) {
        return "List";
    } else if (name.match(/\.(?:get|read|select|download|export|lookup|retrieve|view|wait|watch)[a-zA-Z0-9]*$/g)) {
        return "Read";
    } else if (name.match(/\.(?:write|set|create|update|add|remove|clone|copy|attach|detach|delete|cancel|resume|pause|reset|start|stop|suspend|approve|reject|dismiss|abandon|accept|activate|adjust|advance|allocate|allow|apply|archive|assign|associate|authorize|backup|begin|call|claim|commit|complete|configure|deactivate|delegate|demote|deploy|deprecate|destroy|disable|drop|edit|enable|encrypt|enroll|escalate|evict|execute|extend|failover|finalize|flush|grant|ignore|impersonate|import|ingest|init|initialize|inject|install|instantiate|invalidate|invoke|label|lease|lift|link|lock|manage|manipulate|migrate|mirror|modify|move|mutate|orchestrate|patch|place|post|process|promote|provision|publish|purchase|purge|push|put|receive|record|reenable|reencrypt|refresh|rejoin|release|rename|renew|replace|replicate|rerun|reschedule|reset|resize|resolve|restart|restore|resync|reverse|revert|revoke|rollback|rollout|rotate|route|run|scan|schedule|seed|send|share|simulate|snapshot|submit|subscribe|switch|sync|target|terminate|test|train|truncate|tune|unassociate|unbind|undelete|undeploy|undo|unenroll|uninstall|upgrade|upload|validate|verify)[a-zA-Z0-9]*$/g)) {
        return "Write";
    }
    return "Unknown";
}

function addcomma(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function mapAPIToIAMService(service_mapping, api) {
    if (service_mapping["api"][api]) {
        return service_mapping["api"][api];
    }
    return api;
}

function mapIAMToAPIService(service_mapping, iam) {
    if (service_mapping["iam"][iam]) {
        return service_mapping["iam"][iam];
    }
    return iam;
}

async function processReferencePage() {
    let methods_raw_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/methods.json');
    let methods_raw = await methods_raw_data.json();

    let tags_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/tags.json');
    let tags = await tags_data.json();

    let iam_extra_methods_raw_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/iam_extra_methods.json');
    let iam_extra_methods_raw = await iam_extra_methods_raw_data.json();

    let methods_combined = Object.assign({}, iam_extra_methods_raw, methods_raw);

    let methods = [];
    for (let k of Object.keys(methods_combined)) {
        methods_combined[k]['id'] = k;
        methods.push(methods_combined[k]);
    }
    let api = null;

    let service_mapping_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/service_mapping.json');
    let service_mapping = await service_mapping_data.json();

    let permissions_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/role_permissions.json');
    let permissions = await permissions_data.json();

    let predefinedroles_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/predefined_roles.json');
    let predefinedroles = await predefinedroles_data.json();

    let map_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/map.json');
    let map = await map_data.json();

    $('#actions-table tbody').html('');

    methods.sort((a, b) => a['title'].toLowerCase() < b['title'].toLowerCase() ? -1 : 1)

    if ($('#reference-list').html() == "") {
        for (let apiitem of methods) {
            if (window.location.pathname == "/iam/" + mapAPIToIAMService(service_mapping, apiitem['id'])) {
                api = apiitem;

                $('#reference-list').append('<li class="nav-item active"><a href="/iam/' + mapAPIToIAMService(service_mapping, apiitem['id']) + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else if (window.location.pathname == "/api/" + apiitem['id']) {
                api = apiitem;

                $('#reference-list').append('<li class="nav-item active"><a href="/api/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else if (window.location.pathname.startsWith("/api/")) {
                $('#reference-list').append('<li class="nav-item"><a href="/api/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else {
                $('#reference-list').append('<li class="nav-item"><a href="/iam/' + mapAPIToIAMService(service_mapping, apiitem['id']) + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            }
        }
    }

    function openSearchModal() {
        $('.navbar-search').addClass('visible');
        $('.backdrop').addClass('show');
        setTimeout(() => {
            $('.navbar-search-header > input').focus();
        }, 100);
    }

    // Search
    $('#search-nav').on('click', function(e){
        e.preventDefault();
        openSearchModal()
    });

    $(window).on('keydown', function(e) {
        // Slash without any special keys to open search modal
        if (e.keyCode === 191 && !e.shiftKey && !e.ctrlKey && !e.ctrlKey && !e.metaKey) {
            if (!$('.navbar-search').hasClass('visible')) {
                openSearchModal()
                e.preventDefault();
            }
        }
        // Escape without any special keys to close search modal
        if (e.keyCode === 27 && !e.shiftKey && !e.ctrlKey && !e.ctrlKey && !e.metaKey) {
            if ($('.navbar-search').hasClass('visible')) {
                $('.navbar-search').removeClass('visible');
                $('.backdrop').removeClass('show');
                e.preventDefault();
            }
        }
    })

    $('.navbar-search-header > input').on('input', function(e){
        let searchterm = $('.navbar-search-header > input').val().toLowerCase();

        // IAM
        let html = '';
        let results = [];
        for (let permission_name of Object.keys(permissions)) {
            if (permission_name.toLowerCase().startsWith(searchterm)) {
                results.push(permission_name);
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            var permission_name_parts = results[i].split(".");

            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/iam/${permission_name_parts[0]}#${results[i]}\">${results[i]}</a></li>`;
        };
        $('#search-iam-list').html(html);

        // API
        html = '';
        results = [];
        for (let apiitem of methods) {
            for (let method_name of Object.keys(apiitem['methods'])) {
                if (method_name.toLowerCase().startsWith(searchterm)) {
                    results.push(method_name);
                }
                if (results.length >= 10) break;
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            var method_name_parts = results[i].split(".");

            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/api/${method_name_parts[0]}#${results[i]}\">${results[i]}</a></li>`;
        };
        $('#search-api-list').html(html);

        // Managed Policies
        html = '';
        results = [];
        for (let role of predefinedroles) {
            if (role['name'].replace("roles/", "").toLowerCase().includes(searchterm) || role['title'].toLowerCase().includes(searchterm)) {
                results.push([role['name'].replace("roles/", ""), role['title']]);
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/predefinedroles/${results[i][0]}\">${results[i][1]} (${results[i][0]})</a></li>`;
        };
        $('#search-predefinedroles-list').html(html);
    });

    // omnibox search
    if (window.location.search.includes('s=')) {
        $('.navbar-search').addClass('visible');
        $('.backdrop').addClass('show');
        setTimeout(() => {
            $('.navbar-search-header > input').focus();
            $('.navbar-search-header > input').val(getQueryVariable('s'));
            $('.navbar-search-header > input').trigger('input');
        }, 100);
    }

    //
    $('#body-dashboard').attr('style', 'display: none;');
    $('#body-usage').attr('style', 'display: none;');
    $('#body-predefinedroles').attr('style', 'display: none;');
    $('#body-permissions').attr('style', 'display: none;');
    $('#body-predefinedrole').attr('style', 'display: none;');
    if (window.location.pathname == "/") {
        $('#nav-general-dashboard').addClass('active');
        $('#body-dashboard').attr('style', '');
        loadDashboardCharts();
    } else if (window.location.pathname.startsWith("/usage")) {
        $('#nav-general-usage').addClass('active');
        $('#body-usage').attr('style', '');
    } else if (window.location.pathname.startsWith("/predefinedroles/")) {
        $('#nav-general-predefinedrole').addClass('active');
        $('#body-predefinedrole').attr('style', '');
    } else if (window.location.pathname.startsWith("/predefinedroles")) {
        $('#nav-general-predefinedroles').addClass('active');
        $('#body-predefinedroles').attr('style', '');
    } else if (window.location.pathname.startsWith("/iam") || window.location.pathname.startsWith("/api")) {
        $('#body-permissions').attr('style', '');
    } else {
        // TODO
    }

    if (window.location.pathname.startsWith("/iam/")) {
        $('.display-iam').attr('style', '');
        $('.display-api').attr('style', 'display: none;');
    } else if (window.location.pathname.startsWith("/api/")) {
        $('.display-iam').attr('style', 'display: none;');
        $('.display-api').attr('style', '');
    }

    if (api) {
        $('.servicename').html(api['title'].replace(/ API$/, ""));

        $('.iam-link').click(() => {
            window.location.pathname = "/iam/" + mapAPIToIAMService(service_mapping, window.location.pathname.replace("/api/", ""));
        });
        $('.api-link').click(() => {
            window.location.pathname = "/api/" + mapIAMToAPIService(service_mapping, window.location.pathname.replace("/iam/", ""));
        });
        
        let actions_table_content = '';
        let iam_count = 0;
        for (let permission_name of Object.keys(permissions)) {
            if (permission_name.startsWith(window.location.pathname.replace("/iam/", "") + ".") || permission_name.startsWith(mapAPIToIAMService(service_mapping, window.location.pathname.replace("/api/", "")) + ".")) {
                iam_count += 1;
            }
            if (permission_name.startsWith(mapAPIToIAMService(service_mapping, window.location.pathname.replace("/iam/", "")) + ".")) {
                let access_class = "tx-success";
                let permission_level = get_permission_level(permission_name);
                if (["Write", "Permissions management"].includes(permission_level)) {
                    access_class = "tx-pink";
                }
                if (["Unknown"].includes(permission_level)) {
                    access_class = "tx-color-03";
                }

                let predefined_roles = [];
                let undocumented = false;
                for (let predefined_role of permissions[permission_name]) {
                    predefined_roles.push("<a href=\"/predefinedroles/" + predefined_role['id'].replace("roles/", "") + "\">" + predefined_role['name'] + "</a> <span class=\"tx-color-03\">(" + predefined_role['id'] + ")</span>");
                    if (predefined_role['undocumented']) {
                        undocumented = true;
                    }
                }

                if (permissions[permission_name].length == 0) {
                    undocumented = true;
                }

                /*
                if (privilege['description'].substr(privilege['description'].length-1) != "." && privilege['description'].length > 1) {
                    privilege['description'] += ".";
                }
                */

                let parts = permission_name.split(".");

                let used_by = [];
                for (var map_service_name of Object.keys(map['api'])) {
                    if (map['api'][map_service_name]['methods']) {
                        for (var map_method_name of Object.keys(map['api'][map_service_name]['methods'])) {
                            if (map['api'][map_service_name]['methods'][map_method_name]['permissions']) {
                                for (var map_permission of map['api'][map_service_name]['methods'][map_method_name]['permissions']) {
                                    if (map_permission['name'] == permission_name) {
                                        var map_method_base = map_method_name.split(".")[0];
                                        used_by.push("<a href='/api/" + map_method_base + "#" + map_method_name + "'>" + map_method_name + "</a>");
                                    }
                                }
                            }
                        }
                    }
                }
                var used_by_out = used_by.join("<br />");
                if (used_by.length == 0) {
                    used_by_out = "-";
                }

                actions_table_content += '<tr id="' + permission_name + '">\
                    <td class="tx-medium"><span class="tx-color-03">' + parts.shift() + '.</span>' + parts.join(".") + (tags['iam']['DataAccess'].includes(permission_name) ? ' <span class="badge badge-info">data access</span>' : '') + (tags['iam']['CredentialExposure'].includes(permission_name) ? ' <span class="badge badge-info">credentials exposure</span>' : '') + (tags['iam']['PrivEsc'].includes(permission_name) ? ' <span class="badge badge-warning">possible privesc</span>' : '') + (undocumented ? ' <span class="badge badge-danger">undocumented</span>' : '') + '</td>\
                    <td class="tx-medium">' + used_by_out + '</td>\
                    <td class="' + access_class + '">' + permission_level + '</td>\
                    <td class="tx-medium">' + predefined_roles.join("<br />") + '</td>\
                </tr>';
            }
        }
        $('#actions-table tbody').append(actions_table_content);
        $('.iam-count').html(iam_count);

        // api
        let method_table_content = '';
        let api_count = 0;
        for (let method_name of Object.keys(api['methods'])) {
            let method = api['methods'][method_name];

            let method_name_parts = method_name.split(".");

            let description = method['description'].split(". ")[0];
            if (!description.endsWith(".")) {
                description += ".";
            }

            var iam_action_out = "-";
            if (map['api'][method_name_parts[0]] && map['api'][method_name_parts[0]]['methods'] && map['api'][method_name_parts[0]]['methods'][method_name] && map['api'][method_name_parts[0]]['methods'][method_name]['permissions'] && Array.isArray(map['api'][method_name_parts[0]]['methods'][method_name]['permissions'])) {
                if (map['api'][method_name_parts[0]]['methods'][method_name]['permissions'].length == 0) {
                    iam_action_out = "<i>None required</i>";
                } else {
                    var iam_action = [];
                    for (var permission of map['api'][method_name_parts[0]]['methods'][method_name]['permissions']) {
                        var map_permission_base = permission['name'].split(".")[0];
                        iam_action.push("<a href='/iam/" + map_permission_base + "#" + permission['name'] + "'>" + permission['name'] + "</a>");
                    }
                    iam_action_out = iam_action.join("<br />");
                }
            }

            method_table_content += '<tr id="' + method_name + '">\
                <td class="tx-medium"><span class="tx-color-03">' + method_name_parts.shift() + '.</span>' + method_name_parts.join(".") + '</td>\
                <td class="tx-normal">' + description + '</td>\
                <td class="tx-medium">' + method['versions'].join(", ") + '</td>\
                <td class="tx-medium">' + iam_action_out + '</td>\
            </tr>';

            api_count += 1;
        }

        $('.api-count').html(api_count.toString());
        $('#methods-table tbody').append(method_table_content);
    }
    
    // managed policies
    let predefinedroles_table_content = '';
    let deprecated_policy_count = 0;
    for (let role of predefinedroles) {
        let policy_has_undocumented = false;
        if (role['has_undocumented']) {
            policy_has_undocumented = true;
        }
        let policy_has_credentialexposure = false;
        if (role['has_credentialexposure']) {
            policy_credentialexposure = true;
        }
        let policy_has_dataaccess = false;
        if (role['has_dataaccess']) {
            policy_has_dataaccess = true;
        }
        let policy_has_privesc = false;
        if (role['has_privesc']) {
            policy_has_privesc = true;
        }

        let rolename = role['name'].replace("roles/", "");
        predefinedroles_table_content += '<tr>\
        <td class="tx-medium"><a href="/predefinedroles/' + encodeURIComponent(rolename) + '">' + role['title'] + "</a>" + (policy_has_dataaccess ? ' <span class="badge badge-info">data access</span>' : '') + (policy_has_credentialexposure ? ' <span class="badge badge-info">credentials exposure</span>' : '') + (policy_has_privesc ? ' <span class="badge badge-warning">possible privesc</span>' : '') + (role['stage'] == "DEPRECATED" ? ' <span class="badge badge-danger">deprecated</span>' : '') + (policy_has_undocumented ? ' <span class="badge badge-danger">undocumented actions</span>' : '') + (role['stage'] == "BETA" ? ' <span class="badge badge-warning">beta</span>' : '') + '</td>\
            <td class="tx-medium">' + rolename + '</td>\
            <td class="tx-normal">' + role['description'] || '-' + '</td>\
        </tr>';

        if (role['stage'] == "DEPRECATED") {
            deprecated_policy_count += 1;
        }

        if (window.location.pathname.startsWith("/predefinedroles/") && rolename.toLowerCase() == window.location.pathname.replace("/predefinedroles/", "").toLowerCase()) {
            let policy = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/roles/' + rolename + '.json');
            let policy_data = await policy.json();

            let tablerows = '';
            for (let perm of policy_data['includedPermissions']) {
                let undocumented = false;

                if (permissions[perm]) {
                    for (let ref_permission of permissions[perm]) {
                        if (ref_permission['id'] == policy_data['name']) {
                            if (ref_permission['undocumented']) {
                                undocumented = true;
                            }
                        }
                    }
                } else {
                    undocumented = true;
                }

                let access_class = "tx-success";
                let permission_level = get_permission_level(perm);
                if (["Write", "Permissions management"].includes(permission_level)) {
                    access_class = "tx-pink";
                }
                if (["Unknown"].includes(permission_level)) {
                    access_class = "tx-color-03";
                }

                tablerows += '<tr>\
                    <td class="tx-medium">' + perm + (tags['iam']['DataAccess'].includes(perm) ? ' <span class="badge badge-info">data access</span>' : '') + (tags['iam']['CredentialExposure'].includes(perm) ? ' <span class="badge badge-info">credentials exposure</span>' : '') + (tags['iam']['PrivEsc'].includes(perm) ? ' <span class="badge badge-warning">possible privesc</span>' : '') + (undocumented ? ' <span class="badge badge-danger">undocumented</span>' : '') + '</td>\
                    <td class="tx-medium">' + perm + '</td>\
                    <td class="' + access_class + '">' + permission_level + '</td>\
                </tr>';
            }

            $('#predefinedroletags').html((policy_has_dataaccess ? ' <span class="badge badge-info">data access</span>' : '') + (policy_has_credentialexposure ? ' <span class="badge badge-info">credentials exposure</span>' : '') + (policy_has_privesc ? ' <span class="badge badge-warning">possible privesc</span>' : '') + (role['stage'] == "DEPRECATED" ? ' <span class="badge badge-danger">deprecated</span>' : '') + (policy_has_undocumented ? ' <span class="badge badge-danger">undocumented actions</span>' : '') + (role['stage'] == "BETA" ? ' <span class="badge badge-warning">beta</span>' : ''));
            $('.predefinedroleraw').html(Prism.highlight(JSON.stringify(policy_data['includedPermissions'], null, 4), Prism.languages.javascript, 'javascript'));
            $('.predefinedrolename').html(role['title'] + " (" + rolename + ")");

            $('#effectivepolicy-table tbody').html(tablerows);
            $('#predefinedrole-json-link').attr('href', 'https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/roles/' + rolename + '.json');
        }
    }

    $('#predefinedroles-table tbody').append(predefinedroles_table_content);

    $('.active-predefinedroles-count').html(predefinedroles.length - deprecated_policy_count);
    $('.deprecated-predefinedroles-count').html(deprecated_policy_count);

    // Total counts
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    let apicount = 0;
    for (let apiitem of methods) {
        apicount += Object.keys(apiitem['methods']).length;
    }
    $('.total-iamactions').html(numberWithCommas(Object.keys(permissions).length));
    $('.total-apimethods').html(numberWithCommas(apicount));
    $('.total-predefinedroles').html(numberWithCommas(predefinedroles.length));

    $('[data-toggle="tooltip"]').tooltip();

    // scroll to hash
    if (window.location.hash != "") {
        try {
            $('.content-body').scrollTop($(window.location.hash).offset().top - $('.content-header').height() + 1);
        } catch (e) {}
    }

    $(() => {
        $(".table-responsive").floatingScroll();
    });    
}

processReferencePage();
