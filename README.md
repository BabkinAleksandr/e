# Letta (E)

Yet another javascript library for modern web applications.

## Features

### Zero-build

No need to set up webpack, esbuild or any other js build tool. Just put a `<script/>` in your html and you're good to go.

### Pure JS

No additional concepts to learn. No additional syntax to learn.

__Letta__ is just a tiny wrapper adding reactivity to browser API and making it declarative rather than imperative.

### Tiny

_Fits in 1Kb (gzipped)_!

...okay, that's actually not true at the moment 😁. But it's the desired state.

While project is WIP, there is a lot of code duplicates (really a lot),
console statements and assertions, which would be remove in production minified build.

Also, I think I could split it in to modules, because some features could not be really needed by everyone.

### Fast

Each reactive state update is finely targeted to update only those parts, that use updated value.

### ...Modular?

Didn't decide about this yet.

On one hand we have zero-build library to be used right away.
But on the other hand, if we want to build something mid- or large-sized, where size and performance matter the most, modularity is necessary.

## Why

To have something in between heavy React, Vue, Angular apps;
purely static or bloated backend generated JS;
manually written JS scripts.

Could be a good companion for Backend web frameworks,
which does not have their own js generation,
or which does have such, but less efficient and more heavy.

---

But, essentially, for education purposes. I wonder if I'm cappable to do so.

If I'll manage to make the first working release, I can say I've reached the target.
If __Letta__ would be helpful to anyone, for educational purposes or to breath a bit of life to your static apps, I could not be happier.

## Not

Things this project doesn't have:

- SSR  
   I consider adding integration with popular server-side libs, like: RoR, Laravel and other.
   But the whole purpose of this library is to keep javascript scripting in control.

- Modules  
   As it's non-build pure javascript library, it's designed to be plugged in to page right away.
   JavaScript in browser does not support modules fully and it's not convenient to plug in each module by hand.
