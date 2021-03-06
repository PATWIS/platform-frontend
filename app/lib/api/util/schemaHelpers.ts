import { mapValues } from "lodash";
import * as moment from "moment";
import * as Yup from "yup";

/**
 * Schema helpers
 * semi documented.... :)
 */
export const makeAllRequired = (schema: Yup.ObjectSchema): Yup.ObjectSchema => {
  const oldFields: { [key: string]: Yup.MixedSchema } = (schema as any).fields;
  const newFields = mapValues(oldFields, schema => schema.required("This field is required"));
  return Yup.object().shape(newFields);
};

/**
 * Date schema
 */
const DATE_SCHEME = "YYYY-M-D";
const parse = (s: string) => moment(s, DATE_SCHEME, true);
export const date = Yup.string()
  .transform(function(_value: any, originalValue: string): string {
    const date = parse(originalValue);
    if (!date.isValid()) {
      return "";
    }
    return date.format(DATE_SCHEME);
  })
  .test("is-valid", "Please enter a valid date", s => {
    return parse(s).isValid();
  });

export const personBirthDate = date
  .test("is-old-enough", "This person must be older than 18 years.", s => {
    const d = parse(s);
    return d.isValid() && d.isBefore(moment().subtract(18, "years"));
  })
  .test("is-young-enough", "This person must be younger than 100 years.", s => {
    const d = parse(s);
    return d.isValid() && d.isAfter(moment().subtract(100, "years"));
  });

export const foundingDate = date.test(
  "is-old-enough",
  "Founding date can not be in the future",
  s => {
    const d = parse(s);
    return d.isValid() && d.isBefore(moment());
  },
);

export const citizen = Yup.bool();

export const isUsCitizen = citizen.test("is-us-citizen", "US citizen is disallowed", response => {
  return response === false;
});
