# Frontend

Project structure adapted from [this template](https://github.com/jonashackt/spring-boot-vuejs).

Make sure you're in `/frontend` before running these commands.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development, runs backend concurrently
```
npm run dev
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Bootstrap-Vue

The project is configured to use [Bootstrap-Vue](https://bootstrap-vue.js.org/docs/components/). Add any components you

## Font Awesome Icons

The project is configured to use Font Awesome icons. To add an icon, first go to the Font Awesome icon list and find an appropriate icon.

1. Go to [`main.js`](src/main.js) and add the icon name to the import statement from `@fortawesome/free-solid-svg-icons`. This import has code-completion, so you should be able to find the icon name quickly.
1. Still in [`main.js`](src/main.js), add the imported object to the `library.add(...)` statement.
1. You can now add the icon to your Vue components and views. Instantiate a new component with `<font-awesome-icon icon="my-imported-icon" />`

You can configure the look and feel of the icons as well. See the [reference documentation](https://github.com/FortAwesome/vue-fontawesome#the-icon-property) for more information.

## /views vs /components

Both the `/views` and `/components` directories hold Vue components. The components in `/views` act as _views_ for routing, as in the router will map one or more URLs to the component. If you look at `/router/index.js`, the URLs are mapped to `About.vue` and `Home.vue`. On the other hand, `/components` holds any Vue components which wil not be routed to.

You can think of views as pages. For example, `/views` could have a `User.vue` for a user profile, `Settings.vue` for a settings screen, etc.

On the other hand, `/components` has our `backend-api.js` because that will be needed across the different "pages". It also has the "HelloWorld" template, which can be populated with different data for different views.

:)
