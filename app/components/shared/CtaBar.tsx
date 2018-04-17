import * as React from "react";

import { Button } from "./Buttons";

import * as styles from "./CtaBar.module.scss";

interface IProps {
  message: string;
  ctaText: string;
  onClick: () => void
}

export const CtaBar: React.SFC<IProps> = ({ onClick, ctaText, message }) => {
  return (
    <div className={styles.ctaBar}>
      <p>{message}</p>
      <Button onClick={onClick}>{ctaText}</Button>
    </div>
  );
};
