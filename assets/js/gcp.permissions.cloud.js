// gcp.permissions.cloud Core Functionality

var custom_policy_timer;


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
    if (name.match(/\.list[a-zA-Z0-9]*$/g)) {
        return "List";
    } else if (name.match(/\.(?:get|read|select)[a-zA-Z0-9]*$/g)) {
        return "Read";
    } else if (name.match(/\.(?:write|set|create|update|add|remove|clone|copy|attach|detach|delete|cancel|resume|pause|reset|start|stop|suspend)[a-zA-Z0-9]*$/g)) {
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

async function processReferencePage() {
    let methods_raw_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/methods.json');
    let methods_raw = await methods_raw_data.json();
    let methods = [];
    for (let k of methods_raw) {
        methods_raw[k]['id'] = k;
        methods.push(methods_raw[k]);
    }
    let api = null;

    let permissions_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/permissions.json');
    let permissions = await permissions_data.json();

    $('#actions-table tbody').html('');

    methods.sort((a, b) => a['title'].toLowerCase() < b['title'].toLowerCase() ? -1 : 1)

    if ($('#reference-list').html() == "") {
        for (let apiitem of methods) {
            if (window.location.pathname == "/iam/" + apiitem['id']) {
                api = apiitem;

                $('#reference-list').append('<li class="nav-item active"><a href="/iam/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else if (window.location.pathname == "/api/" + apiitem['id']) {
                api = apiitem;

                $('#reference-list').append('<li class="nav-item active"><a href="/api/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else if (window.location.pathname.startsWith("/api/")) {
                $('#reference-list').append('<li class="nav-item"><a href="/api/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            } else {
                $('#reference-list').append('<li class="nav-item"><a href="/iam/' + apiitem['id'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
            }
        }
    }

    // Search
    $('#search-nav').on('click', function(e){
        e.preventDefault();
        $('.navbar-search').addClass('visible');
        $('.backdrop').addClass('show');
        setTimeout(() => {
            $('.navbar-search-header > input').focus();
        }, 100);
    });

    /*
    $('.navbar-search-header > input').on('input', function(e){
        let searchterm = $('.navbar-search-header > input').val().toLowerCase();

        // IAM
        let html = '';
        let results = [];
        for (let service of iam_def) {
            for (let privilege of service['privileges']) {
                let fullpriv = service['prefix'] + ":" + privilege['privilege'];
                if (service['prefix'].toLowerCase().startsWith(searchterm) || privilege['privilege'].toLowerCase().startsWith(searchterm) || fullpriv.toLowerCase().startsWith(searchterm)) {
                    results.push(fullpriv);
                }
                if (results.length >= 10) break;
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/iam/${results[i].split(":")[0]}#${results[i].replace(":", "-")}\">${results[i]}</a></li>`;
        };
        $('#search-iam-list').html(html);

        // API
        html = '';
        results = [];
        for (let iam_mapping_name of Object.keys(sdk_map['sdk_method_iam_mappings']).sort()) {
            let split_name = iam_mapping_name.split(".");
            if (split_name[0].toLowerCase().startsWith(searchterm) || split_name[1].toLowerCase().startsWith(searchterm) || iam_mapping_name.toLowerCase().startsWith(searchterm)) {
                results.push(iam_mapping_name);
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/api/${sdk_map['sdk_method_iam_mappings'][results[i]][0]['action'].split(":")[0]}#${results[i].replace(".", "_")}\">${results[i]}</a></li>`;
        };
        $('#search-api-list').html(html);

        // Managed Policies
        html = '';
        results = [];
        for (let managedpolicy of managedpolicies['policies']) {
            if (managedpolicy['name'].toLowerCase().includes(searchterm)) {
                results.push(managedpolicy['name']);
            }
            if (results.length >= 10) break;
        }
        for (let i=0; i<results.length && i<10; i++) {
            html += `<li style=\"margin-left: 5px; margin-top: 5px;\"><a href=\"/managedpolicies/${results[i]}\">${results[i]}</a></li>`;
        };
        $('#search-managedpolicies-list').html(html);
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
    */

    // resource type modal
    /*
    $('#resourceTypeModal').on('show.bs.modal', function (e) {
        let offset = 1;
        let rtdstart = "{";
        let rtdend = "\n}";        
        let tokens = $(e.relatedTarget).html().split(/(\[\]|\.)/g);
        for (let token of tokens) {
            if (token == "[]") {
                rtdstart += "[\n" + "    ".repeat(offset + 1);
                rtdend = "\n" + "    ".repeat(offset) + "]" + rtdend;
                offset += 1;
            } else if (token == ".") {
                rtdstart += "{" + "    ".repeat(offset + 1);
                rtdend = "\n" + "    ".repeat(offset) + "}" + rtdend;
                offset += 1;
            } else if (token == "") {
                // nothing
            } else {
                rtdstart += "\n" + "    ".repeat(offset) + "\"" + token + "\": ";
            }
        }
        rtdstart += "\"VALUE\",\n" + "    ".repeat(offset) + "...";
        $('#resourceTypeDisplay').html(rtdstart + rtdend);
    });
    */

    //
    $('#body-dashboard').attr('style', 'display: none;');
    $('#body-usage').attr('style', 'display: none;');
    $('#body-predefinedroles').attr('style', 'display: none;');
    $('#body-permissions').attr('style', 'display: none;');
    $('#body-predefinedrole').attr('style', 'display: none;');
    $('#body-policyevaluator').attr('style', 'display: none;');
    if (window.location.pathname == "/") {
        $('#nav-general-dashboard').addClass('active');
        $('#body-dashboard').attr('style', '');
    } else if (window.location.pathname.startsWith("/usage")) {
        $('#nav-general-usage').addClass('active');
        $('#body-usage').attr('style', '');
    } else if (window.location.pathname.startsWith("/predefinedroles/")) {
        $('#nav-general-predefinedrole').addClass('active');
        $('#body-predefinedrole').attr('style', '');
    } else if (window.location.pathname.startsWith("/predefinedroles")) {
        $('#nav-general-predefinedroles').addClass('active');
        $('#body-predefinedroles').attr('style', '');
    } else if (window.location.pathname.startsWith("/policyevaluator")) {
        $('#nav-general-policyevaluator').addClass('active');
        $('#body-policyevaluator').attr('style', '');
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

    $('.servicename').html(api['title'].replace(/ API$/, ""));

    $('.iam-link').click(() => {
        window.location.pathname = window.location.pathname.replace("/api/", "/iam/");
    });
    $('.api-link').click(() => {
        window.location.pathname = window.location.pathname.replace("/iam/", "/api/");
    });
    
    let actions_table_content = '';
    let iam_count = 0;
    for (let permission_name of Object.keys(permissions)) {
        if (permission_name.startsWith(window.location.pathname.replace("/iam/", ""))) {
            iam_count += 1;
            let access_class = "tx-success";
            let permission_level = get_permission_level(permission_name);
            if (["Write", "Permissions management"].includes(permission_level)) {
                access_class = "tx-pink";
            }
            if (["Unknown"].includes(permission_level)) {
                access_class = "tx-color-03";
            }

            //let used_by = await getUsedBy(service['prefix'] + ':' + privilege['privilege'], sdk_map);
            let used_by = "<i>Coming soon...</i>";

            let predefined_roles = [];
            for (let predefined_role of permissions[permission_name]) {
                predefined_roles.push("<a href=\"/predefinedroles/" + predefined_role['id'] + "\">" + predefined_role['name'] + "</a> <span class=\"tx-color-03\">(" + predefined_role['id'] + ")</span>");
            }

            /*
            if (privilege['description'].substr(privilege['description'].length-1) != "." && privilege['description'].length > 1) {
                privilege['description'] += ".";
            }
            */

            let parts = permission_name.split(".");
            
            actions_table_content += '<tr id="' + permission_name + '">\
                <td class="tx-medium"><span class="tx-color-03">' + parts.shift() + '.</span>' + parts.join(".") + '</td>\
                <td class="tx-medium">' + used_by + '</td>\
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
    for (let method_name of api['methods'].keys()) {
        let method = api['methods'][method_name];

        method_name_parts = method_name.split(".");

        method_table_content += '<tr id="' + method_name + '">\
            <td class="tx-medium"><span class="tx-color-03">' + method_name_parts.shift() + '.</span>' + method_name_parts.join(".") + '</td>\
            <td class="tx-normal">' + method['description'] + '</td>\
            <td class="tx-medium">' + method['versions'].join(", ") + '</td>\
            <td class="tx-medium">' + method['method'] + '</td>\
        </tr>';

        api_count += 1;
    }

    $('.api-count').html(api_count.toString());
    $('#methods-table tbody').append(method_table_content);

    // managed policies
    /*
    let managedpolicies_table_content = '';
    let managedpolicies_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/managed_policies.json');
    let managedpolicies = await managedpolicies_data.json();

    managedpolicies['policies'].sort(function(a, b) {
        if (a['name'] < b['name']) {
            return -1;
        }
        return 1;
    });

    let deprecated_policy_count = 0;
    for (let managedpolicy of managedpolicies['policies']) {
        if (managedpolicy['deprecated']) {
            deprecated_policy_count += 1;
        }

        for (let i=0; i<managedpolicy['access_levels'].length; i++) {
            let access_class = "tx-success";
            if (["Write", "Permissions management"].includes(managedpolicy['access_levels'][i])) {
                access_class = "tx-pink";
            }
            if (["Unknown"].includes(managedpolicy['access_levels'][i])) {
                access_class = "tx-color-03";
            }
            managedpolicy['access_levels'][i] = "<span class=\"" + access_class + "\">" + managedpolicy['access_levels'][i] + "</span>";
        }

        managedpolicies_table_content += '<tr>\
            <td class="tx-medium"><a href="/managedpolicies/' + managedpolicy['name'] + '">' + managedpolicy['name'] + "</a>" + (managedpolicy['resource_exposure'] ? ' <span class="badge badge-info">resource exposure</span>' : '') + (managedpolicy['credentials_exposure'] ? ' <span class="badge badge-info">credentials exposure</span>' : '') + (managedpolicy['unknown_actions'] ? ' <span class="badge badge-warning">unknown actions</span>' : '') + (managedpolicy['privesc'] ? ' <span class="badge badge-warning">possible privesc</span>' : '') + (managedpolicy['malformed'] ? ' <span class="badge badge-danger">malformed</span>' : '') + (managedpolicy['deprecated'] ? ' <span class="badge badge-danger">deprecated</span>' : '') + (managedpolicy['undocumented_actions'] ? ' <span class="badge badge-danger">undocumented actions</span>' : '') + '</td>\
            <td class="tx-normal">' + managedpolicy['access_levels'].join(", ") + '</td>\
            <td class="tx-normal">' + managedpolicy['version'] + '</td>\
            <td class="tx-normal" style="text-decoration-line: underline; text-decoration-style: dotted;">' + readable_date(managedpolicy['createdate']) + '</td>\
            <td class="tx-normal" style="text-decoration-line: underline; text-decoration-style: dotted;">' + readable_date(managedpolicy['updatedate']) + '</td>\
        </tr>';

        if (window.location.pathname.startsWith("/predefinedroles/") && managedpolicy['name'] == window.location.pathname.replace("/predefinedroles/", "")) {
            let policy = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/managedpolicies/' + managedpolicy['name'] + '.json');
            let policy_data = await policy.json();
            $('.managedpolicyraw').html(Prism.highlight(JSON.stringify(policy_data['document'], null, 4), Prism.languages.javascript, 'javascript'));
            $('.managedpolicyname').html(managedpolicy['name']);
            processManagedPolicy(policy_data, iam_def);
            $('#managedpolicy-json-link').attr('href', 'https://raw.githubusercontent.com/iann0036/iam-dataset/main/managedpolicies/' + managedpolicy['name'] + '.json');
        }
    }

    $('#predefinedroles-table tbody').append(managedpolicies_table_content);

    $('.active-predefinedroles-count').html(managedpolicies['policies'].length - deprecated_policy_count);
    $('.deprecated-predefinedroles-count').html(deprecated_policy_count);
    */

    $('[data-toggle="tooltip"]').tooltip();

    // scroll to hash
    if (window.location.hash != "") {
        try {
            $('.content-body').scrollTop($(window.location.hash).offset().top - $('.content-header').height() + 1);
        } catch (e) {}
    }

    // policy evaluator
    /*
    if (window.location.pathname.startsWith("/policyevaluator")) {
        $('.custompolicy').bind('input propertychange', function() {
            clearTimeout(custom_policy_timer);
            custom_policy_timer = setTimeout(function(){
                processCustomPolicy(iam_def);
            }, 800);
        });
    }
    */
}

processReferencePage();
