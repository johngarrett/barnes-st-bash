function poll_registration_status() {
    const fname_input = document.getElementById("fname");
    const lname_input = document.getElementById("lname");
    const register_button = document.getElementById("register-button")

    register_button.disabled = fname_input.value.length == 0 || lname_input.value.length == 0;
}

function track_view() {
    fetch(
        "https://drop1.garrepi.dev/track-view"
        , {
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
    .then(() => {
        fetch_view_count();
    })
    .catch(error => {
        console.log('error tracking view', error);
    })

}

function fetch_guests() {
    fetch("https://drop1.garrepi.dev/guests")
        .then(res => res.json())
        .then(guests => {
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
    fetch("https://drop1.garrepi.dev/guest-count")
        .then(res => res.json())
        .then(count => {
            const guestCounter = document.getElementById("guest-count");
            guestCounter.textContent = count + " people registered";
        })
        .catch(err => {
            const guestCounter = document.getElementById("guest-count");
            guestCounter.textContent = "Error fetching guest count";
            console.log('guest count: ', error);
        });
}

function fetch_view_count() {
    fetch("https://drop1.garrepi.dev/view-count")
        .then(res => res.json())
        .then(count => {
            const guestCounter = document.getElementById("view-count");
            guestCounter.textContent = count + " views";
        })
        .catch(err => {
            const guestCounter = document.getElementById("view-count");
            guestCounter.textContent = "Error fetching view count";
            console.log('view count: ', error);
        });
}

function register() {
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
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
        const t = document.createTextNode(res.result);
        p.appendChild(t);
        document.getElementById("input-pane").replaceChildren(...[p]);
    })
    .catch(error => {
        console.log('error ', error);
        const p = document.createElement("p");
        const t = document.createTextNode(error);
        p.appendChild(t);
        document.getElementById("input-pane").replaceChildren(...[p]);
    })
    .finally(() => {
        fetch_guests();
        fetch_guest_count();
    });
}

track_view();
fetch_guests();
fetch_guest_count();
fetch_view_count();
poll_registration_status();
