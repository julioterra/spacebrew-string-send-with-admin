/**
 * Spacebrew Admin Dropdown Generator
 * --------------------------------
 *
 * This script enables you to easily add drop down menus for subscribers and publishers to your
 * admin-enabled client spacebrew apps.
 *
 * Please note that this library only works will the Spacebrew.js library sb-admin-0.1.0 and 
 * above.
 * 
 * @author 		Julio Terra
 * @filename	sb-admin-dropdown-gen-0.1.0.js
 * @version 	0.1.0
 * @date 		April 20, 2013
 * 
 */

	var pubs = {}
		, subs = {}
		, types = []
		;


		/**
		 * ADMIN DROPDOWN MENU HANDLER METHODS
		 */

		function initDropdown() {
			console.log("[checkIfMobile] checking if app loaded on mobile device  ");

			$("select.spacebrew-select").each(function(index, item) {
				var data_type = $(item).attr("data-type");

				addType( data_type );

				// add the appropriate class to each select object
				var new_class = "select-" + $(item).attr("data-pub-or-sub") + "-" + data_type;
				$(item).addClass( new_class );

				// add the appropraite id to each select object
				var new_id = new_class + "-" + $(item).attr("data-local-route-name");
				$(item).attr( "id", new_id );

				$(item).attr( "multiple", "multiple");

				// add placeholder text to the dropdown menu
				var placeholder_text = "choose the ";
				if ($(item).attr("data-pub-or-sub") === "subscribe") placeholder_text += "subcriber";
				else placeholder_text += "publisher";					
				var $placeholder_option = $('<option>', { value: "", text: placeholder_text, "data-placeholder": "true"});
				$placeholder_option.appendTo("#" + item.id);
			}); 

			$("select.spacebrew-select").each( function(i, $item) {
				if (!$.browser.mobile) $("#" + $item.id).attr("data-native-menu", "false");
				else $("#" + $item.id).attr("data-native-menu", "true");
			});

			// $("select.spacebrew-select").each( function(i, $item) {
			// 	if (!$.browser.mobile) $("#" + $item.id).attr("data-native-menu", "false");
			// 	else $("#" + $item.id).attr("data-native-menu", "true");
			// });

		}

		function addType( new_type ) {
			for ( var i = 0; i < types.length; i++ ) {
				if (types[i] === new_type) return;
			}

			types.push(new_type);
			pubs[new_type] = [];
			subs[new_type] = [];
		}

		function registerDataTypes( type_list ) {
			types = type_list;
			checkIfMobile();
			console.log("[registerDataTypes] registering data types ", types);
		}

		function updateRouteFromUI ( event, self ) {
			var local_pub_sub_name
				, remote_address
				, client_name
				, remote_pub_sub_name
				, prev_state
				, opt_selected
				;

			local_pub_sub_name = $($(self)[0]).attr("data-local-route-name");	
			pub_or_sub = $($(self)[0]).attr("data-pub-or-sub");	

			for ( var i = 0; i < event.target.length; i++ ) {
				prev_state = $(event.target[i]).attr("data-prev-state");
				opt_selected = event.target[i].selected

				if (i == 0) continue; 
				if ( !(opt_selected && prev_state === "false") && !(!opt_selected && prev_state === "true") ) {
					continue;										
				} 

				remote_pub_sub_name = $(event.target[i]).attr("data-remote-route-name");
				client_name = $(event.target[i]).attr("data-client-name");
				remote_address = $(event.target[i]).attr("data-remote-address");

				if (opt_selected && prev_state === "false") {
					console.log("[updateRouteFromUI] adding '" + pub_or_sub + "' route");
					if (pub_or_sub === "subscribe") {
						sb.addSubRoute( local_pub_sub_name, client_name, remote_address, remote_pub_sub_name );
					}
					else if (pub_or_sub === "publish") {
						sb.addPubRoute( local_pub_sub_name, client_name, remote_address, remote_pub_sub_name );						
					}
					$(event.target[i]).attr("data-prev-state", "true");					
				} 

				else if (!opt_selected && prev_state === "true") {
					console.log("[updateRouteFromUI] removing '" + pub_or_sub + "' route");
					if (pub_or_sub === "subscribe") {
						sb.removeSubRoute( local_pub_sub_name, client_name, remote_address, remote_pub_sub_name );	
					}				
					else if (pub_or_sub === "publish") {
						sb.removePubRoute( local_pub_sub_name, client_name, remote_address, remote_pub_sub_name );	
					}
					$(event.target[i]).attr("data-prev-state", "false");					
				}
			}
		}

		function updateRouteFromServer ( type, pub, sub ) {
			var pub_sub_id
				, select_id
				, connecting_to_pub_or_sub
				, cur_check = ["publish", "subscribe"]
				, pub_or_sub_local = {}
				, pub_or_sub_remote = {}
				, cur_option = {}
				;

			for (var i = 0; i < cur_check.length; i++) {
				console.log ("[updateRouteFromServer] updating ", cur_check[i]);

				// assign local and remote pub and sub objectives to appropriate variables
				if (cur_check[i] === "subscribe") {
					pub_or_sub_local = pub;
					pub_or_sub_remote = sub;
				} else {
					pub_or_sub_local = sub;					
					pub_or_sub_remote = pub;
				}

				// if current app is involved in route
				if (sb.isThisApp(pub_or_sub_local.clientName, pub_or_sub_local.remoteAddress)) {
					pub_sub_id = pub_or_sub_remote.clientName + "_" + pub_or_sub_remote.remoteAddress + "_" + pub_or_sub_remote.name + "_" + cur_check[i];
					pub_sub_id = pub_sub_id.replace(/ /g, "");
					select_id = "select-" + cur_check[i] + "-" + pub_or_sub_remote.type + "-" + pub_or_sub_local.name ;
				}

				// if route doesn't involve current app then abort
				else {
					console.log ("[updateRouteFromServer] route doesn't involve this client");
					continue;
				}

				console.log ("[updateRouteFromServer] '" + type + "' route to dropdown '" + select_id + "' option '" + pub_sub_id + "'");

				// if add route message then select appropriate drop down option
				if (type === "add") {
					cur_option = $('#' + select_id).find('option[value="' + pub_sub_id + '"]')
		
					console.log ("[updateRouteFromServer] add select ", cur_option[0]);

					// make sure that drop-down option is of appropriate type (pub or sub)
					if ($(cur_option[0]).attr("data-pub-or-sub") === cur_check[i]) {
						if (!$(cur_option[0]).attr("selected")) {
							$(cur_option[0]).attr("selected", "selected");
							$(cur_option[0]).attr("data-prev-state", "true");						
						}
					}
				} 

				// if remove message then de-select approrpriate drop down option
				else if (type === "remove") {
					cur_option = $('#' + select_id).find('option[value="' + pub_sub_id + '"]');

					console.log ("[updateRouteFromServer] remove selection ", cur_option[0]);

					// make sure that drop-down option is of appropriate type (pub or sub)
					if ($(cur_option[0]).attr("data-pub-or-sub") === cur_check[i]) {
						if ($(cur_option[0]).attr("selected")) {
							$(cur_option[0]).removeAttr("selected");
							$(cur_option[0]).attr("data-prev-state", "false");						
						}
					}
				}
			}
		}	

		function addPubSub (client) {
			console.log ("[addPubSub] adding new client to pub and sub lists", client);
			for (var i = 0; i < types.length; i++) {
				_addPubSub(client, types[i], "publish",  pubs[types[i]]);
				_addPubSub(client, types[i], "subscribe",  subs[types[i]]);
			}
		}

		function removePubSub (name, address) {
			for (var i = 0; i < types.length; i++) {
				_removePubSub(name, address, pubs[types[i]]);
				_removePubSub(name, address, subs[types[i]]);
			}
		}

		function _removePubSub(name, address, pub_sub_array) {
			var client_id = name + "_" + address;
			client_id = client_id.replace(/ /g, "");

			// extract appropriate pub or sub elements from new client 
			console.log("[removePubSub] removing client '" + name + "' with address '" + address + "'");

			// and loop through each one to add to list.
			for (var i = pub_sub_array.length - 1; i >= 0 ; i --) {
				console.log("[removePubSub] " + client_id  + " comp to " + pub_sub_array[i].clientId);
				if (client_id === pub_sub_array[i].clientId) {				
					console.log("[removePubSub] found client with id " + client_id );
					if ($("option[name='" + client_id + "']")) {
						$("option[name='" + client_id + "']").remove();
					}
				}
			}			
		}	

		function _addPubSub (client, type, pub_or_sub, pub_sub_array) {
			var client_id = client.name + "_" + client.remoteAddress;
				client_id = client_id.replace(/ /g, "");

			// and loop through each one to add to list.
			for (var j = 0; j < pub_sub_array.length; j ++) {
				if (pub_sub_array[j].clientId === client_id) {
					removePubSub(client.name, client.remoteAddress, pub_sub_array);
					break;
				}
			}

			// extract appropriate pub or sub elements from new client 
			var new_subs_or_pubs = extractPubOrSubFromClient(client, type, pub_or_sub);
			if (new_subs_or_pubs.length <= 0) return;
			console.log("[addPubSub] adding '" + pub_or_sub + "' of type '" + type + "' from ", client);

			// and loop through each one to add to list.
			for (var i = 0; i < new_subs_or_pubs.length; i ++) {

				// add new subscribe elements to local array
				pub_sub_array.push(new_subs_or_pubs[i]);

				// loop through pub or sub drop down of appropriate type to add new items
				if ($("select.select-" + pub_or_sub + "-" + type)) {
					$("select.select-" + pub_or_sub + "-" + type).each( function(index, $item) {
						var $new_option = $('<option>', { 
										value: new_subs_or_pubs[i].id
										, text: new_subs_or_pubs[i].clientName + " : " + new_subs_or_pubs[i].name
										, name: new_subs_or_pubs[i].clientId
						});

						$new_option.attr("data-remote-route-name", new_subs_or_pubs[i].name);
						$new_option.attr("data-client-name", new_subs_or_pubs[i].clientName);
						$new_option.attr("data-remote-address", new_subs_or_pubs[i].remoteAddress);
						$new_option.attr("data-pub-or-sub", pub_or_sub);
						$new_option.attr("data-prev-state", "false");
						$new_option.appendTo("#" + $item.id);

						console.log("[addPubSub] created add option: ", $new_option);
						console.log("[addPubSub] created to dropdown menu: ", $item);
					});					
				}
			}			
		}

		function extractPubOrSubFromClient (client, type, pub_or_sub){
			var pub_sub_item = {}
				, new_item = {}
				, pub_sub_list = []
				, client_id = ""
				, pub_sub_id = ""
				;

			// loop through pub or sub elements to extract appropriate types
			for( var j = 0; j < client[pub_or_sub].messages.length; j++ ){
				pub_sub_item = client[pub_or_sub].messages[j];
				if ( pub_sub_item.type === type ) {

					client_id = client.name + "_" + client.remoteAddress;
					client_id = client_id.replace(/ /g, "");

					pub_sub_id = client_id + "_" + pub_sub_item.name + "_" + pub_or_sub;
					pub_sub_id = pub_sub_id.replace(/ /g, "");

					new_item = { clientName: client.name
								, remoteAddress: client.remoteAddress 
								, name: pub_sub_item.name
								, type: pub_sub_item.type
								, id: pub_sub_id
								, clientId: client_id
							};
					pub_sub_list.push( new_item );
				}			
			}
			console.log("[extractPubOrSubFromClient] returning list of " + pub_or_sub, pub_sub_list );
			return pub_sub_list;
		}