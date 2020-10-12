function checkType() {
    newType = document.getElementById('newType').value;

    if(!newType) {
        alert("Type must not be null");
        return false;
    } else {
        alert(`Adding ${newType}!`);
    }
}

function checkTypeStrength() {
    typeForStrength = document.getElementById('typeForStrength').value;
    typeStrength = document.getElementById('typeStrength').value;

    if(typeStrength == -1 || typeForStrength == -1) {
        alert("Type and Type Strength must not be null");
        return false;
    } else {
        alert(`Adding Strength!`);
    }
}

function checkTypeWeakness() {
    typeForWeakness = document.getElementById('typeForWeakness').value;
    typeWeakness = document.getElementById('typeWeakness').value;

    if(typeWeakness == -1 || typeForWeakness == -1) {
        alert("Type and Type Weakness must not be null");
        return false;
    } else {
        alert(`Adding Weakness!`);
    }
}