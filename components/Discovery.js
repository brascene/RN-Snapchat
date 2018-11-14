// @flow
import * as React from "react";
import {
  View, StyleSheet, ScrollView, SafeAreaView,
} from "react-native";

import StoryThumbnail from "./StoryThumbnail";
import StoryModal from "./StoryModal";
import type { Story } from "./StoryModel";

type DiscoveryProps = {
  stories: Story[];
};

type DiscoveryState = {
  selectedStory: Story | null,
  position: Position | null,
};

export default class Discovery extends React.PureComponent<DiscoveryProps, DiscoveryState> {
  state = {
    selectedStory: null,
    position: null,
  }

  constructor(props: DiscoveryProps) {
    super(props);
    this.thumbnails = props.stories.map(() => React.createRef());
  }

  selectStory = async (selectedStory: Story, index: number) => {
    const position = await this.thumbnails[index].current.measure();
    this.setState({ selectedStory, position });
  }

  onClose = () => {
    this.setState({ selectedStory: null, position: null });
  }

  render() {
    const { onClose } = this;
    const { stories } = this.props;
    const { selectedStory, position } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <SafeAreaView
            style={styles.content}
            contentInsetAdjustmentBehavior="automatic"
          >
            {stories.map((story, index) => (
              <StoryThumbnail
                ref={this.thumbnails[index]}
                key={story.id}
                {...{ story }}
                onPress={() => this.selectStory(story, index)}
                selected={!!selectedStory && selectedStory.id === story.id}
              />
            ))}
          </SafeAreaView>
        </ScrollView>
        {selectedStory && (<StoryModal story={selectedStory} {... { position, onClose }} />)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingTop: 64,
  },
});
