// @flow
import * as React from "react";
import {
  View, StyleSheet, Image, Dimensions, TouchableWithoutFeedback,
} from "react-native";

import type Story from "./StoryModel";

const width = Dimensions.get("window").width / 2 - 16 * 2;
const height = width * 1.77;

type StoryThumbnailProps = {
  story: Story,
  onPress: () => mixed,
  selected: boolean,
};

export default class StoryThumbnail extends React.PureComponent<StoryThumbnailProps> {
  thumbnail = React.createRef()

  measure = (): Position => new Promise(resolve => this.thumbnail.current.measureInWindow((x, y, width, height) => resolve({
    x, y, width, height,
  })));

  render() {
    const { story, onPress, selected } = this.props;
    return (
      <View style={styles.container}>
        {
          !selected ? (
            <TouchableWithoutFeedback {...{ onPress }}>
              <Image ref={this.thumbnail} source={story.source} style={styles.image} />
            </TouchableWithoutFeedback>
          ) : <View style={styles.image} />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    marginTop: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: null,
    height: null,
    borderRadius: 5,
  },
});
