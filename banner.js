document.addEventListener("deviceready", async () => {

    if (!window.Capacitor) return;

    const { AdMob } = window.Capacitor.Plugins;

    try {

        await AdMob.initialize();

        setTimeout(async () => {

            await AdMob.showBanner({
                adId: "ca-app-pub-4315317994778211/8316818727",
                position: "BOTTOM_CENTER",
                margin: 0,
                isTesting: false 
            });

            console.log("Banner Loaded");

        }, 1000);

    } catch (e) {

        console.log(e);

    }

});