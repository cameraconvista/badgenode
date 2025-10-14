import * as DM from "@radix-ui/react-dropdown-menu";

export const Menu = DM.Root;
export const MenuTrigger = DM.Trigger;

export function MenuContent(props: React.ComponentProps<typeof DM.Content>) {
  return <DM.Content {...props} className={"bn-pop bn-z-pop p-1 " + (props.className ?? "")} />;
}

export function MenuItem(props: React.ComponentProps<typeof DM.Item>) {
  return <DM.Item {...props} className={"bn-pop-item " + (props.className ?? "")} />;
}
