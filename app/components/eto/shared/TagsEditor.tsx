import { includes } from "lodash";

import * as React from "react";
import { Input } from "reactstrap";

import { Button } from "../../shared/Buttons";
import { Tag } from "../../shared/Tag";

import * as checkIcon from "../../../assets/img/inline_icons/check.svg";
import * as plusIcon from "../../../assets/img/inline_icons/plus_bare.svg";
import * as styles from "./TagsEditor.module.scss";

interface IPropsWrapper {
  selectedTagsLimit: number;
  selectedTags: string[];
  availiableTags: string[];
}

interface IProps {
  handleSubmit: any;
  handleInput: any;
  handleSelectedTagClik: any;
  handleDeselectedTagClick: any;
  selectedTags: string[];
  availiableTags: string[];
  inputValue: string;
}

interface IStateWrapper {
  selectedTags: string[];
  tags: string[];
  inputValue: string;
}

const TagsEditor: React.SFC<IProps> = props => {
  return (
    <div className={styles.tagsEditor}>
      <form className={styles.form} onSubmit={e => props.handleSubmit(e)}>
        <Input
          placeholder="Add category"
          value={props.inputValue}
          onChange={e => props.handleInput(e)}
        />
        <Button type="submit">Add</Button>
      </form>
      {!!props.selectedTags.length && (
        <div className={styles.selectedTags}>
          {props.selectedTags.map(tag => (
            <Tag
              onClick={() => props.handleSelectedTagClik(tag)}
              text={tag}
              svgIcon={checkIcon}
              size="small"
              theme="dark"
              key={tag}
            />
          ))}
        </div>
      )}
      {!!props.availiableTags.length && (
        <div>
          {props.availiableTags.map(tag => (
            <Tag
              onClick={() => props.handleDeselectedTagClick(tag)}
              size="small"
              svgIcon={plusIcon}
              text={tag}
              key={tag}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export class TagsEditorWidget extends React.Component<IPropsWrapper, IStateWrapper> {
  state = {
    selectedTags: [...this.props.selectedTags],
    tags: [...this.props.availiableTags],
    inputValue: "",
  };

  createTag = () => {
    const { tags, selectedTags } = this.state;
    const tag = this.state.inputValue.trim().replace(/\s\s+/g, " ");
    const tagExist = includes(tags, tag) || includes(selectedTags, tag);
    const isTooShort = tag.length < 1;

    if (tagExist || isTooShort) {
      return;
    }

    this.setState({ inputValue: "", tags: [tag, ...tags] });
  };

  handleTagSelection = (tag: string) => {
    const { selectedTagsLimit } = this.props;
    const { tags, selectedTags } = this.state;
    const isLimitReached = selectedTags.length === selectedTagsLimit;

    if (isLimitReached) {
      return;
    }

    this.setState({
      selectedTags: [tag, ...selectedTags],
      tags: tags.filter(filteredTag => filteredTag !== tag),
    });
  };

  handleTagDeselection = (tag: string) => {
    const { tags, selectedTags } = this.state;

    this.setState({
      selectedTags: selectedTags.filter(filteredTag => filteredTag !== tag),
      tags: [tag, ...tags],
    });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.createTag();
  };

  handleInput = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  componentDidMount(): void {
    const { selectedTags, availiableTags } = this.props;

    if (!selectedTags.length) {
      return;
    }

    const tags = availiableTags.filter(avaliableTag => !includes(selectedTags, avaliableTag));
    this.setState({ tags });
  }

  render(): React.ReactNode {
    return (
      <TagsEditor
        selectedTags={this.state.selectedTags}
        availiableTags={this.state.tags}
        handleSubmit={this.handleSubmit}
        handleInput={this.handleInput}
        handleSelectedTagClik={this.handleTagDeselection}
        handleDeselectedTagClick={this.handleTagSelection}
        inputValue={this.state.inputValue}
      />
    );
  }
}
