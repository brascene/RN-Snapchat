// @flow
import * as React from "react";
import {
  View, StyleSheet, Image, Dimensions,
} from "react-native";
import Animated from "react-native-reanimated";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import { Video } from "expo";

import type Story from "./StoryModel";

const wWidth = Dimensions.get("window").width;
const wHeight = Dimensions.get("window").height;

type StoryModalProps = {
  story: Story,
  position: Position,
};

const {
  Value,
  Clock,
  cond,
  eq,
  set,
  block,
  clockRunning,
  startClock,
  spring,
  stopClock,
  event,
  and,
  lessOrEq,
  greaterThan,
  call,
  interpolate,
} = Animated;

function runSpring(value, dest) {
  const clock = new Clock();

  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0),
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, 0),
      set(state.time, 0),
      set(state.position, value),
      set(config.toValue, dest),
      startClock(clock),
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    set(value, state.position),
  ];
}

export default class StoryModal extends React.PureComponent<StoryModalProps> {
  constructor(props: StoryModalProps) {
    super(props);

    const {
      x, y, width, height,
    } = props.position;

    this.translateX = new Value(x);
    this.translateY = new Value(y);
    this.width = new Value(width);
    this.height = new Value(height);
    this.velocityY = new Value(0);
    this.stateGesture = new Value(State.UNDETERMINED);

    this.onGestureEvent = event([{
      nativeEvent: {
        translationX: this.translateX,
        translationY: this.translateY,
        velocityY: this.velocityY,
        state: this.stateGesture,
      },
    }], { useNativeDriver: true });
  }

  render() {
    const { story, position, onClose } = this.props;
    const {
      translateX, translateY, width, height, onGestureEvent,
    } = this;

    const animatedStyle = {
      ...StyleSheet.absoluteFillObject,
      width,
      height,
      transform: [
        { translateY },
        { translateX },
      ],
    };

    return (
      <View style={styles.container}>
        <Animated.Code>
          {
            () => block([
              cond(eq(this.stateGesture, State.UNDETERMINED), runSpring(translateX, 0)),
              cond(eq(this.stateGesture, State.UNDETERMINED), runSpring(translateY, 0)),
              cond(eq(this.stateGesture, State.UNDETERMINED), runSpring(width, wWidth)),
              cond(eq(this.stateGesture, State.UNDETERMINED), runSpring(height, wHeight)),
              cond(and(
                eq(this.stateGesture, State.END),
                lessOrEq(this.velocityY, 0),
              ), block([
                runSpring(translateX, 0),
                runSpring(translateY, 0),
                runSpring(width, wWidth),
                runSpring(height, wHeight),
              ])),
              cond(and(
                eq(this.stateGesture, State.END),
                greaterThan(this.velocityY, 0),
              ), block([
                runSpring(translateX, position.x),
                runSpring(translateY, position.y),
                runSpring(width, position.width),
                runSpring(height, position.height),
                cond(eq(height, position.height), call([], onClose)),
              ])),
              cond(eq(this.stateGesture, State.ACTIVE), set(this.height, interpolate(this.translateY, {
                inputRange: [0, wHeight],
                outputRange: [wHeight, position.height],
              }))),
              cond(eq(this.stateGesture, State.ACTIVE), set(this.width, interpolate(this.translateX, {
                inputRange: [0, wWidth],
                outputRange: [wWidth, position.width],
              }))),
            ])
          }
        </Animated.Code>
        <PanGestureHandler
          activeOffsetY={100}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onGestureEvent}
        >
          <Animated.View style={animatedStyle}>
            {
              story.video && (
                <Video
                  source={story.video}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                  style={styles.video}
                />
              )
            }
            {
              !story.video && (
                <Image source={story.source} style={styles.image} />
              )
            }
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: null,
    height: null,
    borderRadius: 5,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
  },
});
