import { useAppState } from '../store';
import NewPlanSheet from './NewPlanSheet';
import PickTradeSheet from './PickTradeSheet';
import MoneySheet from './MoneySheet';
import ConfirmDeleteSheet from './ConfirmDeleteSheet';
import SettingsSheet from './SettingsSheet';
import PickerSheet from './PickerSheet';
import NoPlanSheet from './NoPlanSheet';
import BEAskSheet from './BEAskSheet';
import WarnSheet from './WarnSheet';

export default function Sheets() {
  const state = useAppState();

  return (
    <>
      {state.sheet === 'newplan' && <NewPlanSheet />}
      {state.sheet === 'pick' && <PickTradeSheet />}
      {state.sheet === 'money' && <MoneySheet />}
      {state.sheet === 'confirm' && <ConfirmDeleteSheet />}
      {state.sheet === 'settings' && <SettingsSheet />}
      {state.sheet === 'noplan' && <NoPlanSheet />}
      {state.sheet === 'beask' && <BEAskSheet />}
      {state.sheet === 'warn' && <WarnSheet />}
      {state.picker && <PickerSheet />}
    </>
  );
}
