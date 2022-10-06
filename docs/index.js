function fetch_guests() {
    console.log('fetching guests');
    fetch("https://drop1.garrepi.dev/guests")
        .then(res => res.json())
        .then(guests => {
            console.log(guests);
            const nodes = guests
                .map(guest => `${guest.fname} ${guest.lname}`)
                .map(name => {
                    const p = document.createElement("p");
                    const t = document.createTextNode(name);
                    p.appendChild(t);

                    return p;
                });

            document.getElementById("guests").replaceChildren(...nodes);
        })
        .catch(err => {
            console.log(err);
        });
}

function fetch_guest_count() {
    console.log('fetching guest count');
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
}


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
    .then(res => res.json())
    .then(res => {
        /*
            1. `#input-pane` remove children
            2. add success text and calendar invite
            3. update guests
         */
        const p = document.createElement("p");
        const t = document.createTextNode(JSON.stringify(res.result));
        p.appendChild(t);
        document.getElementById("input-pane").replaceChildren(...p);
    })
    .catch(error => {
        console.log('error ', error);
        const p = document.createElement("p");
        const t = document.createTextNode(JSON.stringify(error));
        p.appendChild(t);
        document.getElementById("input-pane").replaceChildren(...p);
    })
    .finally(() => {
        fetch_guests();
        fetch_guest_count();
    });
}

fetch_guests();
fetch_guest_count();
