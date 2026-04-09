import InputField from '../common/InputField'
import Button from '../common/Button'
import FormSection from './FormSection'
import { FIELD_META, FORM_SECTIONS } from '../../utils/fieldMeta'

export default function HouseForm({ values, onChange, onSubmit, onReset, isLoading }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      className="space-y-3"
    >
      {FORM_SECTIONS.map((section) => (
        <FormSection key={section.title} title={section.title}>
          {section.fields.map((fieldName) => {
            const meta = FIELD_META[fieldName]
            return (
              <InputField
                key={fieldName}
                name={fieldName}
                value={values[fieldName]}
                onChange={onChange}
                {...meta}
              />
            )
          })}
        </FormSection>
      ))}

      <p className="text-xs text-slate-400 px-1">
        All fields are optional — missing values are filled with Ames Housing dataset medians.
      </p>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
          Predict Price
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
          Reset
        </Button>
      </div>
    </form>
  )
}
