import toRegex from 'path-to-regexp'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

function push(path) {
    return history.push(path)
}

function matchURI(path, uri) {
    const keys : any[] = [];
    const pattern = toRegex(path, keys); // TODO: Use caching
    const match = pattern.exec(uri);
    if (!match) return null;
    const params = Object.create(null);
    for (let i = 1; i < match.length; i++) {
        params[keys[i - 1].name] =
            match[i] !== undefined ? match[i] : undefined;
    }
    return params;
}

async function resolve(routes, context) {
    for (const route of routes) {

        const uri = context.error ? '/error' : context.pathname;
        const params = matchURI(route.path, uri);
        if (!params) continue;
        if (route.redirect) {
            const to = route.redirect()
            history.replace(to)
            return
        }
        const result = await route.action({ ...context, params });
        if (result) {
            window.scrollTo(0, 0)
            return result;
        }
    }

    throw `Route for ${context.pathname} not found`;
}

export {
    history,
    push,
    resolve
}
