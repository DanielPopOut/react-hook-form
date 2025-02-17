import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import isArray from '../utils/isArray';
import unset from '../utils/unset';
import { Field, FieldRefs, FieldValues } from '../types';

export default function findRemovedFieldAndRemoveListener<
  FormValues extends FieldValues
>(
  fields: FieldRefs<FormValues>,
  handleChange: ({ type, target }: Event) => Promise<void | boolean>,
  field: Field,
  forceDelete?: boolean,
): void {
  const {
    ref,
    ref: { name, type },
    mutationWatcher,
  } = field;

  if (!type) {
    delete fields[name];
    return;
  }

  const fieldValue = fields[name];

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldValue) {
    const { options } = fieldValue;

    if (isArray(options) && options.length) {
      options
        .filter(Boolean)
        .forEach(({ ref, mutationWatcher }, index): void => {
          if ((ref && isDetached(ref)) || forceDelete) {
            removeAllEventListeners(ref, handleChange);

            if (mutationWatcher) {
              mutationWatcher.disconnect();
            }

            unset(options, [`[${index}]`]);
          }
        });

      if (options && !options.filter(Boolean).length) {
        delete fields[name];
      }
    } else {
      delete fields[name];
    }
  } else if (isDetached(ref) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }

    delete fields[name];
  }
}
