import * as Mnemonic from "bitcore-mnemonic";
import { range } from "lodash";
import * as React from "react";
import Select from "react-virtualized-select";
import { Col, Row } from "reactstrap";

import { Button } from "../../shared/Buttons";
import { WarningAlert } from "../../shared/WarningAlert";

import * as arrowLeft from "../../../assets/img/inline_icons/arrow_left.svg";

/* tslint:disable: no-submodule-imports */
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import "react-virtualized/styles.css";
/* tslint:enable: no-submodule-imports */

import * as styles from "./BackupSeedVerify.module.scss";

export const WORDS_TO_VERIFY = 4;
const wordsOptions = Mnemonic.Words.ENGLISH.map((word: string) => ({ value: word, label: word }));

interface IBackupSeedVerifyProps {
  onNext: () => void;
  onBack: () => void;
  words: string[];
}

export interface IBackupSeedVerifyState {
  verificationWords: {
    number: number;
    word: string;
  }[];
}

// here it's good enough
const getRandomNumbers = (numbers: number, range: number): number[] => {
  const arr = [];
  while (arr.length < numbers) {
    const randomNumber = Math.floor(Math.random() * range);
    if (arr.indexOf(randomNumber) > -1) continue;
    arr[arr.length] = randomNumber;
  }
  return arr.sort((a, b) => a - b);
};

export class BackupSeedVerify extends React.Component<
  IBackupSeedVerifyProps,
  IBackupSeedVerifyState
> {
  constructor(props: IBackupSeedVerifyProps) {
    super(props);

    const wordsToCheck = getRandomNumbers(WORDS_TO_VERIFY, props.words.length);

    this.state = {
      verificationWords: wordsToCheck.map(number => ({ number: number, word: "" })),
    };
  }

  updateValueFactory = (wordOnPageNumber: number) => (newValue: any): void => {
    const verificationWords = this.state.verificationWords;
    verificationWords[wordOnPageNumber].word = newValue;
    this.setState({
      verificationWords,
    });
  };

  validateWord = (wordOnPageNumber: number): boolean | undefined => {
    const wordNumber = this.state.verificationWords[wordOnPageNumber].number;
    const word = this.state.verificationWords[wordOnPageNumber].word;
    if (word) {
      return word === this.props.words[wordNumber];
    } else {
      return undefined;
    }
  };

  getValidationStyle = (wordOnPageNumber: number): string => {
    const validationResult = this.validateWord(wordOnPageNumber);
    if (validationResult !== undefined) {
      return validationResult ? styles.valid : styles.invalid;
    } else {
      return "";
    }
  };

  showInvalidMsg = (): boolean => {
    let show = false;
    for (let i = 0; i < WORDS_TO_VERIFY; i++) {
      show = show || this.validateWord(i) === false;
    }
    return show;
  };

  allWordsValid = (): boolean => {
    let valid = true;
    for (let i = 0; i < WORDS_TO_VERIFY; i++) {
      valid = valid && this.validateWord(i) === true;
    }
    return valid;
  };

  generateSelect = (wordOnPageNumber: number): React.ReactNode => (
    <Select
      options={wordsOptions}
      simpleValue
      matchPos="start"
      matchProp="value"
      value={this.state.verificationWords[wordOnPageNumber].word}
      onChange={this.updateValueFactory(wordOnPageNumber)}
      placeholder="enter word"
      noResultsText="no matching word"
      className={this.getValidationStyle(wordOnPageNumber)}
    />
  );

  render(): React.ReactNode {
    return (
      <>
        <Row>
          <Col xs={{ size: 10, offset: 1 }}>
            <Row>
              {range(0, WORDS_TO_VERIFY).map((num, wordPageNumber) => {
                const wordNumber = this.state.verificationWords[wordPageNumber].number;
                return (
                  <Col
                    xs={{ size: 6, offset: 3 }}
                    sm={{ size: 3, offset: 0 }}
                    key={num}
                    className="my-4"
                  >
                    <div data-test-id={`seed-verify-label`}>{`word ${wordNumber + 1}`}</div>
                    {this.generateSelect(num)}
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
        {this.showInvalidMsg() && (
          <Row className="my-4 justify-content-center">
            <WarningAlert
              data-test-id="seed-verify-invalid-msg"
              className={styles.placeholderHeight}
            >
              Some words you entered are not correct. Please re-check ones marked with orange color.
            </WarningAlert>
          </Row>
        )}
        {this.allWordsValid() && (
          <Row className="my-4 text-center">
            <Col className={styles.placeholderHeight}>
              <Button data-test-id="seed-verify-button-next" onClick={this.props.onNext}>
                continue
              </Button>
            </Col>
          </Row>
        )}
        {!this.showInvalidMsg() &&
          !this.allWordsValid() && (
            <Row className="my-4 text-center">
              <Col className={styles.placeholderHeight} />
            </Row>
          )}
        <Row>
          <Col>
            <Button
              layout="secondary"
              iconPosition="icon-before"
              svgIcon={arrowLeft}
              onClick={this.props.onBack}
            >
              Back
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}
