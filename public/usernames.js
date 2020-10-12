function genUpdateForm(player_id, player_name, index) {
    document.getElementById('players').children[0].children[parseInt(index, 10) + 1].children[0].innerHTML =
       `<form action="/home/updatePlayer" method="post" onsubmit="return checkUpdateName()">
            <input type="text" name="player_name" value="${player_name}" id="updateName">
            <input type="hidden" name="player_id" value="${player_id}">
            <input type="submit" value="Save">
        </form>`;
}

function checkUpdateName() {
    name = document.getElementById('updateName').value;
    if(!name) {
        alert('Username cannot be null.');
        return false;
    }
}

function checkNewUser() {
    name = document.getElementById('newUser').value;
    console.log(name);
    if(!name) {
        alert('Username cannot be null.');
        return false;
    }
}