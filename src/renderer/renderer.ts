// Sends information to the the process.
const sendToProcess = (eventType: string, ...data: any[]): Promise<void> => {
    return window.ipc.send(window, eventType, data);
}

const getElement = (id: string): HTMLElement => document.getElementById(id);

// Handle events from the process.
let looking: [boolean] = [false];

const handleEvent = (eventType: string, data: any[]) => {
    switch (eventType) {
        case 'params': {
            const { appName } = data[0];
            Array.from(document.getElementsByClassName('app-name')).forEach((e: HTMLElement) => e.innerText = appName ?? "Template")
            break;
        }
        case "locate": {
            waitCountdown();
            break;
        }

        case "missing_dependency": {
            getElement('content').style.display = "none"
            getElement('missing-dependency').style.display = "";
            getElement('header').style.opacity = '0.5';
            getElement('header').style.pointerEvents = 'none';
            break;
        }

        case 'found-window': {
            isAttached = true;
            looking[0] = false;
            getElement('detach-button').innerText = isAttached ? "Detach" : "Reattach";
            getElement("status").innerText = "Connected";
            getElement("status").style.color = "green";
            break;
        }

        case "lost-window": {
            getElement("status").innerText = "Disconnected";
            getElement("status").style.color = "red";

            break;
        }

        default: {
            console.warn("Uncaught message: " + eventType + " | " + data)
            break;
        }
    }
}

// Attach event handler.
window.ipc.on(window, (eventType: string, data: any[]) => {
    handleEvent(eventType, data);
});



let isAttached: boolean = true;
sendToProcess("init");




getElement('detach-button').addEventListener('click', () => {
    isAttached = !isAttached;

    getElement('detach-button').innerText = isAttached ? "Detach" : "Reattach";
    sendToProcess(!isAttached ? 'detach' : "reattach");
})


const WAIT_TIME_SECONDS: number = 10;

getElement('wait-button').addEventListener('click', () => {
    sendToProcess('wait-for-window');
    waitCountdown()

});
function waitCountdown() {
    looking[0] = true;
    (getElement('wait-button') as HTMLButtonElement).disabled = true;
    (async () => {
        for (let i = 0; i < WAIT_TIME_SECONDS; i++) {
            if (looking[0] === false) {
                break;
            }

            getElement('wait-button').innerText = `Locating window (${WAIT_TIME_SECONDS - i})`;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        getElement('wait-button').innerText = `Locate window`;
        (getElement('wait-button') as HTMLButtonElement).disabled = false;
    })();
}
