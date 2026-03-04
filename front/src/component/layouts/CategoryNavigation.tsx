import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
  getCategoryConfig,
  NavigationGroup,
} from "@/config/sidebar/CategoryConfig";

type CategoryNavigationProps = {
  category: string;
  role: string;
  openListIndex: number;
  onToggle: (index: number) => void;
};

export default function CategoryNavigation({
  category,
  role,
  openListIndex,
  onToggle,
}: CategoryNavigationProps) {
  const config = getCategoryConfig(category);
  const today = moment().format("YYYY-MM-DD");

  const labelWithBr = (label: string) =>
    label.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {line}
      </React.Fragment>
    ));

  const renderNavigationGroup = (group: NavigationGroup) => {
    if (group.showCondition && !group.showCondition(role)) {
      return null;
    }

    if (group.asDirectLink && group.items.length > 0) {
      const item = group.items[0];
      const href = item.href.replace("{{today}}", today);
      return (
        <li key={group.id} className={group.className}>
          <Link href={href || "#"} className="parent">
            <FontAwesomeIcon icon={group.icon} />
            {labelWithBr(group.label)}
          </Link>
        </li>
      );
    }

    const isActive = openListIndex === group.id;

    return (
      <li
        key={group.id}
        className={`${group.className} ${isActive ? "active" : ""}`}
      >
        <span onClick={() => onToggle(group.id)} className="parent">
          <FontAwesomeIcon icon={group.icon} />
          {labelWithBr(group.label)}
        </span>
        <ul>
          {group.items.map((item, index) => (
            <li key={index}>
              <Link href={item.href.replace("{{today}}", today)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  };

  return (
    <div className="list">
      <ul>{config.navigationGroups.map(renderNavigationGroup)}</ul>
    </div>
  );
}
