
// fetch guest count
fetch("https://drop1.garrepi.dev/guest-count")
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
fetch("https://drop1.garrepi.dev/guests")
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

function register() {
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    console.log(`submit called with ${fname} ${lname}`)
    const params = new URLSearchParams({
        fname,
        lname
    });

    fetch(
        "https://drop1.garrepi.dev/register?" + params,
        {
              method: 'POST',
              credentials: 'include',
                headers: {
                    Origin: "https://garrepi.dev/btsb",
                    "Content-Type": "text/plain",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type, Accept"
                }
        }
    )
    .then(res => {
        /*
            1. `#input-pane` remove children
            2. add success text and calendar invite
            3. update guests
         */
        console.log('succcess ', res);
    })
    .catch(error => {
        console.log('error ', error);
    });
}
