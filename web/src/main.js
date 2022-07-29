import { h, render, hydrate } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Endpoints } from './constants';
import App from './components/App';
import './main.css';
function Wrapper() {
    const [user, setUser] = useState(void 0);
    useEffect(() => {
        if (window.HAS_TOKEN !== false) {
            fetch(Endpoints.USER_SELF)
                .then((r) => r.json())
                .then((u) => {
                if (u._id) {
                    const patch = ((newUser) => setUser((oldUser) => ({ ...oldUser, ...newUser, patch: patch })));
                    setUser({ ...u, patch: patch });
                    return;
                }
                setUser(null);
            });
        }
        else {
            setUser(null);
        }
    }, []);
    return h(App, { user: user });
}
if (import.meta.env.DEV) {
    render(h(Wrapper, null), document.querySelector('#app'));
}
else {
    hydrate(h(Wrapper, null), document.querySelector('#app'));
}
