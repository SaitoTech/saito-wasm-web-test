import Saito, {initialize as initSaito} from 'saito-js/index.web';
import WebSharedMethods from 'saito-js/lib/custom/shared_methods.web';

let configs = {
    "server": {
        "host": "127.0.0.1",
        "port": 3000,
        "protocol": "http",
        "endpoint": {
            "host": "127.0.0.1",
            "port": 3000,
            "protocol": "http"
        },
        "verification_threads": 1,
        "channel_size": 10000,
        "stat_timer_in_ms": 5000,
        "thread_sleep_time_in_ms": 10,
        "block_fetch_batch_size": 10
    },
    "peers": [
        {
            "host": "127.0.0.1",
            "port": 13201,
            "protocol": "http",
            "synctype": "full"
        }
    ]
};
initSaito(configs, new WebSharedMethods())
    .then(() => {
        console.log("yyyyyyyyyyy");
    })
