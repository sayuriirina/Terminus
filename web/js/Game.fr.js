var state = new GameState();
//read cookie if one exists
var current_room = state.getCurrentRoom();
// var current_room = KernelFiles;
var man_pages = {"cd": "Le manuscript ancien résonne entre tes deux tympans : \n"+
"(Choisis ta destination) Utilises \"cd\" pour explorer le monde. \n" +
" Il faut écrire : cd LIEU_DE_DESTINATION \n" +
 "Rappelles t'en...", 
"mv": "Le manuscript ancien résonne entre tes deux tympans : \n" + 
"(MouVement). \n Utilises \"mv\" pour déplacer un objet. \n Il fait écrire :" + 
"mv OBJET LIEU_DE_DESTINATION \n" + 
"Rappelles t'en...",
"ls": "Le manuscript ancien résonne entre tes deux tympans : \n" + 
"(Regarde autour de toi). \n Utilises \"ls\" pour voir ce qui se trouve dans un lieu donné. " +
"Soit tu observe là où tu es, soit tu observe un autre lieu.\n"+
" Il faut écrire : \n" + 
"ls          (pour voir autour de toi) \n" + 
"-OR- \n" + 
"ls LOCATION     (pour voir là ou tu ne peux pas choisir ta destination \"cd\" )\n" + 
"Rappelles t'en...", 
"less": "Le manuscript ancien résonne entre tes deux tympans : \n"+
"(Lire, Examiner ou parler). \nUtilises \"less\" pour connaître les secrets"+
" liés à un objet. \n" + 
" Il faut écrire : less ITEM\n" +
"Rappelles t'en...", 
"man": "Je suis le manuscrit ancien, et je possède le savoir indispensable aux sorciers. Voici les sorts que je pourais t'enseigner : cd, ls, rm, mv, exit, help, man, touch, grep, pwd.", 
"help": "Écris \"man COMMANDE\" si tu as oublié comment utiliser une commande.", 
"exit": "Le manuscript ancien résonne entre tes deux tympans :\n" + 
"(exit) \n" + 
"Utilises \"exit\" to exit the game permanently. \n" + 
" Il faut écrire : \n" + 
"exit \n" + 
"Rappelles t'en...", 
"cp": "Le manuscript ancien résonne entre tes deux tympans :\n" +
"(CoPy)\n" + 
"Utilises \"cp\" to duplicate an item. \n" + 
" Il faut écrire :\n" + 
"cp ITEM NEWNAME \n" +
"Rappelles t'en...", 
"pwd": "Le manuscript ancien résonne entre tes deux tympans : \n" + 
"(Te montre là où tu es) \n" +
" Il faut écrire : \"pwd\" \n" + 
"Rappelles t'en...",
"grep": "Le manuscript ancien résonne entre tes deux tympans :\n" +
"(gReP : Récupère des parties) \n" + 
"Utilises \"grep\" pour trouver les parties d'un texte qui contiennent le mot magique.\n" + 
" Il faut écrire : \n" + 
"grep MOT_MAGIQUE LÀ_OU_TU_CHERCHE \n" +
"Rappelles t'en...",
"touch": "Le manuscript ancien résonne entre tes deux tympans :\n"+
"(Touche) En touchant un objet (même imaginaire), tu le fait (re)naître comme neuf.\n" +
"Utilises \"touch\"  pour créer de nouveaux objets.\n" +
" Il faut écrire :\n" + 
"touch OBJET \n" + 
"Rappelles t'en...", 
"tellme": "Le manuscript ancien résonne entre tes deux tympans :\n"+
"(tellme combo) tells you the combination for the AthenaCluster rooms at MIT.\n"+
" Il faut écrire :\n"+
"tellme combo\n"+
"Rappelles t'en..."}

$(document).ready(function() {
    $('#term').terminal(function(input, term) {
        var split = input.split(" ");
        var command = split[0].toString();
        var args = split.splice(1,split.length);
        var exec = true;
        if( current_room.commands.indexOf(command) > -1 ){ //Could Utilises current_room.hasOwnProperty(command)
            var prev_room_to_test = current_room;
            if (args.length > 0 && args[0].indexOf("/") > 0){
                var rooms_in_order = args[0].split("/");
                var cur_room_to_test = current_room;
                for (var i = 0; i < rooms_in_order.length; i++){
                    prev_room_to_test = cur_room_to_test;
                    var room_to_cd = rooms_in_order[i];
                    if (i > 0 && rooms_in_order[i-1] === "~"){
                        cur_room_to_test = Home.can_cd(room_to_cd)
                    } else if (room_to_cd === "~"){
                        cur_room_to_test = Home;
                    } else {
                        cur_room_to_test = cur_room_to_test.can_cd(room_to_cd);
                    }
                    if ((command === "cd" || command === "ls") && cur_room_to_test === false){
                        term.echo("That is not reachable from here.");
                        exec = false;
                    }
                }
                args[0] = cur_room_to_test.room_name;
            }
            if (exec){
                var text_to_display = prev_room_to_test[command](args);
                if (text_to_display){
                    term.echo(text_to_display);
                }
                if (command in current_room.cmd_text){
                    term.echo(current_room.cmd_text[command]);
                }
            }
        }
        else{
            term.echo("Command '"+command+"' not found in room '"+current_room.room_name+"'");
        }
    }, { history: true,                     // Keep user's history of commands
        prompt: '>',                        // Text that prefixes terminal entries
        name: 'terminus_terminal',          // Name of terminal
                                            // Signiture to include at top of terminal
        greetings:"Bienvenue à toi apprenti sorcier ! \n" +
		"Pour réussir ta quête, tu devra écrire des sorts magiques appelées commandes. \n" +
		"Ces commandes te permettront de te déplacer et de comprendre le monde plus rapidement que le commun des mortels. \n\n" +
		"Observe ton l'endroit où tu te trouve avec la commande \"ls\". \n" +
		"Déplace toi avec la commande \"cd \" \n" +
		"Tu peux revenir sur tes pas avec la commande \"cd ..\". \n" +
		"Tu peux utilisé des objets avec la commande \"less OBJET\" \n\n" +
    "Si tu es perdu, écris \"pwd\" \n\n" +
		"Explore et va de l'avant.\n" +
    "Pour commencer, écris \"ls\" sans les guillemets et appui sur la touche Entrée .\n",
        exit: false,                        // Disable 'exit' command
        clear: true,                       // Disable 'clear' command
        });
    
    // Clear history on page reload
    $("#term").terminal().history().clear();
    //Give term focus (Fixes weird initial draw issue)
    $("#term").click();
    //Tab Completion FOR LAST ARGUMENT
    $(window).keyup(function(event){
        if(event.keyCode == 9){
            var command = $("#term").terminal().get_command().replace(/\s+$/,"");
            var split_command = command.split(" ");
            var first_arg = split_command[0]
            var last_arg = split_command.pop();
            //Start in a room, try to move through path, and if we get to the end
            // check whether a room/item could complete our trip
            
            //Get starting room
            var search_room;
            if(last_arg.substring(0,1) == "~"){
                search_room = jQuery.extend(true, {}, Home);
            }
            else{
                search_room = jQuery.extend(true, {}, current_room);
            }
            //Iterate through each room
            var path_rooms = last_arg.split("/");
            var new_room;
            var incomplete_room;
            var substring_matches = [];
            for (room_num=0;room_num<path_rooms.length;room_num++)
            {
                new_room = search_room.can_cd(path_rooms[room_num]);
                if(new_room){
                    search_room = new_room;
                }
                else{
                    //We've made it to the final room,
                    // so we should look for things to complete our journey
                    if(room_num == path_rooms.length-1){
                        //IF cd, ls, cp, mv, less
                        //Compare to this room's children
                        if(first_arg == "cd" ||
                            first_arg == "ls" ||
                            first_arg == "mv")
                        {
                            for(child_num = 0; child_num<search_room.children.length; child_num++){
                                if(search_room.children[child_num].room_name.match("^"+path_rooms[room_num])){
                                    substring_matches.push(search_room.children[child_num].room_name);
                                }
                            }
                        }
                        //IF cp, mv, less, grep, touch
                        //Compare to this room's items
                        if(first_arg == "cp" ||
                            first_arg == "mv" ||
                            first_arg == "less" ||
                            first_arg == "grep" ||
                            first_arg == "touch" ||
                            first_arg == "rm" ||
                            first_arg == "sudo")
                        {
                            for(item_num = 0; item_num<search_room.items.length; item_num++){
                                if(search_room.items[item_num].itemname.match("^"+path_rooms[room_num])){
                                    substring_matches.push(search_room.items[item_num].itemname);
                                }
                            }
                        }
                        
                        //If one match exists
                        if(substring_matches.length == 1){
                            path_rooms.pop();
                            path_rooms.push(substring_matches[0]);
                            split_command.push(path_rooms.join("/"))
                            $("#term").terminal().set_command(split_command.join(" "));
                        }
                        //If multiple matches exist
                        else if(substring_matches.length > 1){
                            //Search for longest common substring (taken from: http://stackoverflow.com/questions/1837555/ajax-autocomplete-or-autosuggest-with-tab-completion-autofill-similar-to-shell/1897480#1897480)
                            var lCSindex = 0
                            var i, ch, memo
                            do {
                                memo = null
                                for (i=0; i < substring_matches.length; i++) {
                                    ch = substring_matches[i].charAt(lCSindex)
                                    if (!ch) break
                                    if (!memo) memo = ch
                                    else if (ch != memo) break
                                }
                            } while (i == substring_matches.length && ++lCSindex)

                            var longestCommonSubstring = substring_matches[0].slice(0, lCSindex)
                            //If there is a common substring...
                            if(longestCommonSubstring != ""){
                                //If it already matches the last snippit, then show the options
                                if(path_rooms[room_num] == longestCommonSubstring){
                                    split_command.push(last_arg)                                                    //Join final argument to split_command
                                    $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                                    $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                                    $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                                }
                                //Otherwise, fill in the longest common substring
                                else{
                                    path_rooms.pop();                           //Pop final snippit
                                    path_rooms.push(longestCommonSubstring);    //Push longest common substring
                                    split_command.push(path_rooms.join("/"))    //Join room paths
                                    $("#term").terminal().set_command(split_command.join(" ")); //Set the terminal text to this auto-completion
                                }
                            }
                            //Otherwise, there is no common substring.  Show all of the options.
                            else{
                                split_command.push(last_arg)                                                    //Join final argument to split_command
                                $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                                $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                                $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                            }
                        }
                        //If no match exists
                        else{
                            //DO NOTHING (except remove TAB)
                            $("#term").terminal().set_command(command.replace(/\s+$/,""));
                        }
                    }
                    else{
                        //DO NOTHING (except remove TAB)
                        $("#term").terminal().set_command(command.replace(/\s+$/,""));
                    }
                }
            }
        }
    });
});
console.log("Game : init");
