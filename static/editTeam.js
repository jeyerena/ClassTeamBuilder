$(document).ready(function () {
    var categories = {
        leftHand: 'la',
        aisleLeft: 'al',
        aisleRight: 'ar',
        front: 'f',
        back: 'b',
        broken: 'br',
        frontish: 'fi',
        backish: 'bi',
        left: 'left',
        middle: 'middle',
        right: 'right'
    }
    var rows;
    var cols;
    var maxGroupSize = 6;
    var teamNum = 0;
    var currentTeams = {};
    var roomID;
    var teamName;

    document.getElementById('buildClass-e').onclick = function () {
        this.hidden = true;
        rows = parseInt(tempName.split("-")[3]);
        cols = parseInt(tempName.split("-")[4].split(".")[0]);
        console.log(rows,cols);
        teamName = tempName.split("-")[2];

        roomID = tempName.split("-")[1];
        var table = document.createElement('table');
        table.id = 'dataTable';
        table.border = "1";
        var prevrow;
        var index = 1;
        for (var r = 0; r < (rows); r++) {
            var row = document.createElement('tr');
            let cellRight = false;
            
            for (var c = 0; c < (cols); c++) {
                var cell = document.createElement('td');
                //need to put int to string in here to change to seat letter
                var teamNum = template[index][1];

                if (teamNum != " "){
                    cell.innerHTML = teamNum;
                }else{
                    cell.innerHTML = r + ',' + c;
                }
                cell.id = r + ',' + c;

                row.appendChild(cell);
                //retrieve multiple attributes
                var attrb = template[index].slice(2, template[index].length);
                
                for (let x = 0; x < attrb.length; x++) {
                    let prop = attrb[x];
                    switch (prop) {
                        case "la":
                            cell.classList.toggle("leftHand");
                            cell.classList.toggle('aisleRight');
                            cellRight = false;
                            break;
                        case "f":
                            cell.classList.toggle("front");
                            break;
                        case "fi":
                            cell.classList.toggle("frontish");
                            break;
                        case "a":
                            if (cellRight){
                                cell.classList.toggle("aisleRight");
                                cellRight = false;
                                break
                            }else{
                                cell.classList.toggle("aisleLeft");
                                cellRight = true;
                                break;
                            }
                        case "b":
                            cell.classList.toggle("back");
                            break;
                        case "bi":
                            cell.classList.toggle("backish");
                            break;
                        case "br":
                            cell.classList.toggle("broken");
                            break;
                        case "left":
                            cell.classList.toggle("left");
                            break;
                        case "middle":
                            cell.classList.toggle("middle");
                            break;
                        case "right":
                            cell.classList.toggle("right");
                            break;
                        // }
                    }

                }

                index += 1;

            }
            table.appendChild(row)
            prevrow = row;
        }
        document.getElementById('teamTemp-e').appendChild(table);
        drag();

        // Auto-add suggestions and selection
        var totalSeats = rows * cols;
        for (i = 2; i <= maxGroupSize; i++) {
            if (totalSeats % i == 0) {
                let opt1;
                let opt2;

                if (i == 4 || i == 6) {
                    opt1 = document.createElement("option");
                    opt2 = document.createElement("option");
                    opt1.value = i;
                    opt2.value = i + 10;
                } else {
                    opt1 = document.createElement("option");
                    opt1.value = i;
                }
                if (i == 4 || i == 6) {
                    opt1.innerHTML = 'Groups of ' + i + " (1 x " + i + " )";
                    opt2.innerHTML = 'Groups of ' + i + " (2 x " + i / 2 + " )";
                    document.getElementById('dropdown-e').appendChild(opt1);
                    document.getElementById('dropdown-e').appendChild(opt2);
                }
                else {
                    opt1.innerHTML = 'Groups of ' + i;
                    document.getElementById('dropdown-e').appendChild(opt1);

                }
            }
        }


    }

    document.getElementById("teamButton-e").onclick = function () {
        var table = document.getElementById("dataTable");
        var cells = table.getElementsByClassName("highlight");
        var team = document.createElement('p');

        if (cells.length < 1) {
            return;
        }

        var teamMembers = []
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            for (j = 0; j < teamNum; j++) {
                if (cell.classList.contains("team" + j)) {
                    cell.classList.toggle("team" + j);
                }
            }
            cell.classList.toggle("team" + teamNum);
            cell.innerHTML = teamNum;
            teamMembers.push(cell);
        }
        currentTeams[teamNum] = teamMembers

        team.innerHTML = "Team " + teamNum;
        team.id = "team" + teamNum;
        teamNum += 1;
        // document.getElementById("teamList").appendChild(team);

        cells = table.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.classList.remove("highlight");
        }
    }
    document.getElementById("brokenButton-e").onclick = function () {
        var table = document.getElementById("dataTable");
        var cells = table.getElementsByClassName("highlight");

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.classList.toggle("broken");
        }

        cells = table.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.classList.remove("highlight");
        }
    }

    document.getElementById("saveTeam-e").onclick = function () {
        var array = [];
        array.push([roomID, teamName, rows, cols]);
        array.push(['CID', 'TeamID', 'Attributes']);

        var table = document.getElementById("dataTable");
        var cells = table.getElementsByTagName("td");

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var row = [];
            var cid = cell.id.split(',');
            var isLeft = false;
            row.push(cid[0] + cid[1]);

            for (var j = 0; j < teamNum; j++) {
                if (cell.classList.contains("team" + j)) {
                    row.push(j);
                    break;
                }
            }
            if (row.length == 1) {
                row.push(' ')
            }
            
            for (var key in categories) {
                var cat = categories[key];
                if (cell.classList.contains(key)) {
                    if (cat == 'la'){
                        isLeft = true;
                    }
                    if (cat == 'ar' || cat == 'al'){
                        if (isLeft){

                        }else{
                            row.push('a');
                        }
                        
                    }else{
                        row.push(cat);
                    }
                }
            }
            array.push(row)
        }
        var chairs = JSON.stringify(array);
        setTimeout(function () {
            var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
            xmlhttp.open("POST", "/room-saver");
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.send(chairs);
        }, 1000);
        document.getElementById('notice').innerHTML = 'Team changes saved.'
        setTimeout(function () {
            document.getElementById('notice').innerHTML = 'team save failed'
        }, 2000);
    }
    document.getElementById("removeTeam-e").onclick = function () {
        var table = document.getElementById("dataTable");
        var cells = table.getElementsByClassName("highlight");
        if (cells.length < 1) {
            return;
        }

        var teamMembers = []
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            for (j = 0; j < teamNum; j++) {
                if (cell.classList.contains("team" + j)) {
                    cell.classList.toggle("team" + j);
                }
            }
            cell.innerHTML = [];
        }

        cells = table.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.classList.remove("highlight");
        }
    }
    document.getElementById("resetTeam-e").onclick = function () {
        // alert("lmao");
        var table = document.getElementById("dataTable");
        var cells = table.getElementsByTagName("td");

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            for (var key in currentTeams) {
                if (cell.classList.contains('team' + key)) {
                    cell.classList.toggle('team' + key);
                    if (i != 0) {
                        cell.innerHTML = Math.floor(i / rows) + "," + (i % cols);
                    } else {
                        cell.innerHTML = "0,0";

                    }
                }
            }
        }
    }

    // Automatically add teams based on user selection
    document.getElementById('autoAdd-e').onclick = function () {

        var select = document.getElementById('dropdown-e');
        var idx = select.selectedIndex;
        var selectedOption = select.options[idx];
        var teamSize = selectedOption.value;
        var table = document.getElementById('dataTable');
        var cells = table.getElementsByTagName('td')
        var currTeam = 0;
        var teamMembers = [];
        if (teamSize > maxGroupSize) {
            let groupFactor = 1;
            teamSize = teamSize - 10;
            if (teamSize == 6) {
                groupFactor = 2;
            }
            for (let x = 0; x < cells.length - cols; x++) {
                if (x != 0 && x % cols == 0) {
                    x += cols;
                }
                let cell;
                let cell2;
                cell = cells[x];
                cell2 = cells[x + cols];
                cell.classList.toggle("team" + currTeam);
                cell.innerHTML = currTeam;
                cell2.classList.toggle("team" + currTeam);
                cell2.innerHTML = currTeam;
                teamMembers.push(cell);
                teamMembers.push(cell2);
                if ((x % (teamSize / 2)) == groupFactor) {
                    currentTeams[currTeam] = teamMembers;
                    teamMembers = [];
                    currTeam++;
                }

            }

        } else {
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                if (cell.classList.contains("broken")){
                    i = i + 1;
                    cell = cells[i];
                    console.log("this seat is broken");
                }
                cell.classList.toggle("team" + currTeam);
                cell.innerHTML = currTeam;
                teamMembers.push(cell);
                if (((i + 1) % teamSize) == 0) {
                    currentTeams[currTeam] = teamMembers;
                    teamMembers = [];
                    currTeam++;
                }
            }
        }
        teamNum = currTeam;
    }



    function drag() {
        var isMouseDown = false,
            isHighlighted;
        var startCell, endCell;
        $("#dataTable td")
            .mousedown(function () {
                isMouseDown = true;
                startCell = this;
                $(this).toggleClass("highlight");
                isHighlighted = $(this).hasClass("highlight");
                return false;
            })
            .mouseover(function () {
                if (isMouseDown) {
                    endCell = this;
                    var startX = startCell.id.split(',')[0]
                    var startY = startCell.id.split(',')[1]
                    var endX = endCell.id.split(',')[0]
                    var endY = endCell.id.split(',')[1]
                    if (endX < startX) {
                        var tmp = startX;
                        startX = endX;
                        endX = tmp;
                    }
                    if (endY < startY) {
                        var tmp = startY;
                        startY = endY;
                        endY = tmp;
                    }
                    for (i = startX; i <= endX; i++) {
                        for (j = startY; j <= endY; j++) {
                            var cellID = i + ',' + j;
                            var highlightedCell = document.getElementById(cellID);
                            $(highlightedCell).toggleClass("highlight", isHighlighted);
                        }
                    }
                }
            });

        $(document)
            .mouseup(function () {
                isMouseDown = false;
            });
    }
});