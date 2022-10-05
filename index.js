
// fetch guest count
fetch("/guest-count")
    .then(res => res.json())
    .then(count => {
        console.log(count);
        const guestCounter = document.getElementById("guest-count");
        guestCounter.textContent = count + " people registered.";
    })
    .catch(err => {
        console.log(err);
    });

// fetch guests 
fetch("/guests")
    .then(res => res.json())
    .then(guests => {
        console.log(guests);
        const guestsDiv = document.getElementById("guests");
        guests
            .map(guest => `${guest.fname} ${guest.lname}`)
            .forEach(name => {
                const p = document.createElement("p");
                const t = document.createTextNode(name);
                p.appendChild(t);

                guestsDiv.appendChild(p);
            });
    })
    .catch(err => {
        console.log(err);
    });
