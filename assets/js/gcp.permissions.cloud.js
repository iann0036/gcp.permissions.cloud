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
    let apilist_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/google-api-go-client/api-list.json');
    let apilist = await apilist_data.json();
    apilist = apilist['items'];
    let api = null;

    let permissions_data = await fetch('https://raw.githubusercontent.com/iann0036/iam-dataset/main/gcp/permissions.json');
    let permissions = await permissions_data.json();

    $('#actions-table tbody').html('');

    apilist.sort((a, b) => a['title'].lower() < b['title'].lower() ? -1 : 1)

    if ($('#reference-list').html() == "") {
        for (let apiitem of apilist) {
            if (apiitem['preferred']) {
                if (window.location.pathname == "/iam/" + apiitem['name']) {
                    api = apiitem;

                    $('#reference-list').append('<li class="nav-item active"><a href="/iam/' + apiitem['name'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
                } else if (window.location.pathname == "/api/" + apiitem['name']) {
                    api = apiitem;

                    $('#reference-list').append('<li class="nav-item active"><a href="/api/' + apiitem['name'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
                } else if (window.location.pathname.startsWith("/api/")) {
                    $('#reference-list').append('<li class="nav-item"><a href="/api/' + apiitem['name'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
                } else {
                    $('#reference-list').append('<li class="nav-item"><a href="/iam/' + apiitem['name'] + '" class="nav-link"><span>' + apiitem['title'].replace(/ API$/, "") + '</span></a></li>');
                }
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
    for (let permission_name of permissions.keys()) {
        if (permission_name.startsWith(window.location.pathname.replace("/iam/", ""))) {
            iam_count += 1;
            let access_class = "tx-success";
            /*if (["Write", "Permissions management"].includes(privilege['access_level'])) {
                access_class = "tx-pink";
            }
            if (["Unknown"].includes(privilege['access_level'])) {
                access_class = "tx-color-03";
            }*/

            //let used_by = await getUsedBy(service['prefix'] + ':' + privilege['privilege'], sdk_map);
            let used_by = "<i>Coming soon...</i>";

            let predefined_roles = [];
            for (let predefined_role of permissions[permission_name]) {
                predefined_roles.push(predefined_role['name'] + " <span class=\"tx-color-03\">(" + predefined_role['id'] + ")</span>");
            }

            /*
            if (privilege['description'].substr(privilege['description'].length-1) != "." && privilege['description'].length > 1) {
                privilege['description'] += ".";
            }
            */
            
            actions_table_content += '<tr id="' + permission_name + '">\
                <td class="tx-medium"><span class="tx-color-03">' + "TBC" + ':</span>' + "TBC" + (privilege['access_level'] == "Unknown" ? ' <span class="badge badge-danger">undocumented</span>' : '') + '</td>\
                <td class="tx-normal">' + permission_name + '</td>\
                <td class="tx-medium">' + used_by + '</td>\
                <td class="' + access_class + '">' + "TBC" + '</td>\
                <td class="tx-medium">' + predefined_roles.join("<br />") + '</td>\
            </tr>';
        }
    }
    $('#actions-table tbody').append(actions_table_content);
    $('.iam-count').html(iam_count);

    // get primary
    let api_prefixes = [];
    for (let iam_mapping_name of Object.keys(sdk_map['sdk_method_iam_mappings']).sort()) {
        let first_action = sdk_map['sdk_method_iam_mappings'][iam_mapping_name][0];

        if (first_action['action'].split(":")[0] == service['prefix']) { // TODO: better matching
            api_prefixes.push(iam_mapping_name.split(".")[0]);
        }
    }

    let method_table_content = '';
    let api_count = 0;
    for (let iam_mapping_name of Object.keys(sdk_map['sdk_method_iam_mappings']).sort()) {
        let iam_mapping_name_parts = iam_mapping_name.split(".");
        if (api_prefixes.includes(iam_mapping_name_parts[0])) {
            let first_action = sdk_map['sdk_method_iam_mappings'][iam_mapping_name].shift();

            let rowspan = sdk_map['sdk_method_iam_mappings'][iam_mapping_name].length + 1;

            let actionlink = "/iam/" + first_action['action'].split(":")[0] + "#" + first_action['action'].replace(":", "-");
            let template = await getTemplates(first_action, iam_def_duplicate);
            let undocumented = '';
            if (first_action['undocumented']) {
                undocumented = ' <span class="badge badge-danger">undocumented</span>';
            }

            method_table_content += '<tr id="' + iam_mapping_name_parts[0] + '_' + iam_mapping_name_parts[1] + '">\
                <td rowspan="' + rowspan + '" class="tx-medium"><span class="tx-color-03">' + iam_mapping_name_parts[0] + '.</span>' + iam_mapping_name_parts[1] + '</td>\
                <td rowspan="' + rowspan + '" class="tx-normal">' + shortDocs(iam_mapping_name, docs) + '</td>\
                <td class="tx-medium"><a href="' + actionlink + '">' + first_action['action'] + undocumented + '</a></td>\
                <td class="tx-medium">' + template + '</td>\
            </tr>';

            for (let action of sdk_map['sdk_method_iam_mappings'][iam_mapping_name]) {
                let actionlink = "/iam/" + action['action'].split(":")[0] + "#" + action['action'].replace(":", "-");
                let template = await getTemplates(action, iam_def_duplicate);
                let undocumented = '';
                if (action['undocumented']) {
                    undocumented = ' <span class="badge badge-danger">undocumented</span>';
                }

                method_table_content += '<tr>\
                    <td class="tx-medium" style="padding-left: 10px !important;"><a href="' + actionlink + '">' + action['action'] + undocumented + '</a></td>\
                    <td class="tx-medium">' + template + '</td>\
                </tr>';
            }

            api_count += 1;
        }
    }

    $('.api-count').html(api_count.toString());
    $('#methods-table tbody').append(method_table_content);

    // managed policies

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
