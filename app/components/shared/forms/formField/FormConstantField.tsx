import * as cn from "classnames";
import * as React from "react";

import * as styles from "./FormConstantField.module.scss";

interface IProps {
  value: string;
  className?: string;
}

export const FormConstantField: React.SFC<IProps> = ({ value, className }) => (
  <div className={cn(styles.valueWrapper, className)}>
    <span>{value}</span>
  </div>
);
