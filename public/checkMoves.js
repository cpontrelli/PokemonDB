function checkMove() {
    name = document.getElementById('name').value;
    type = document.getElementById('typeSelected').value;
    pp = type = document.getElementById('ppSelected').value;

    if(!name || type == -1 || !power || !accuracy || !pp) {
        alert("Name, Type, and PP must not be null");
        return false;
    } else {
        alert(`Adding ${name}!`);
    }
}