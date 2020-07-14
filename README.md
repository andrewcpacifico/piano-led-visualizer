# Piano LED Visualizer

# Work in progress!!

Software to control a LED strip using a midi piano input and Arduíno.

## Dependencies

1. Arduíno IDE;
2. Node.js;

## Quickstart

1. Install Arduíno IDE;
2. Install Node.js (I recommend use nvm);
3. Install yarn;

```shell
$ npm i -g yarn
```

4. Install project dependencies;

```shell
$ yarn
```

5. Run project;

```shell
$ yarn start
```

# Known issues

1. Leds remain on after a key release;

I used a simple serial comunication protocol to control how arduíno turns on and off leds, this protocol has some issues and needs to be improved. This problem is related to this.
