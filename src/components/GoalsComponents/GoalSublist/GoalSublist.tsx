import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";

import { GoalItem } from "@src/models/GoalItem";
import { getChildrenGoals, getGoal } from "@src/api/GoalsAPI";
import { createGoalObjectFromTags } from "@src/helpers/GoalProcessor";
import { getSharedWMChildrenGoals, getSharedWMGoal } from "@src/api/SharedWMAPI";
import { displayPartnerMode, lastAction } from "@src/store";
import {
  displayAddGoal,
  displayChangesModal,
  displayGoalId,
  displaySuggestionsModal,
  displayUpdateGoal,
} from "@src/store/GoalsState";

import GoalsList from "../GoalsList";
import ConfigGoal from "../GoalConfigModal/ConfigGoal";

import "./GoalSublist.scss";
import GoalHistory from "./GoalHistory";
import ArchivedAccordion from "../ArchivedAccordion";
import { priotizeImpossibleGoals } from "@src/utils/priotizeImpossibleGoals";

export const GoalSublist = () => {
  const { t } = useTranslation();
  const action = useRecoilValue(lastAction);
  const goalID = useRecoilValue(displayGoalId);
  const showAddGoal = useRecoilValue(displayAddGoal);
  const showUpdateGoal = useRecoilValue(displayUpdateGoal);
  const showChangesModal = useRecoilValue(displayChangesModal);
  const showSuggestionModal = useRecoilValue(displaySuggestionsModal);
  const showPartnerMode = useRecoilValue(displayPartnerMode);
  const [parentGoal, setParentGoal] = useState<GoalItem | null>(null);
  const [childrenGoals, setChildrenGoals] = useState<GoalItem[]>([]);
  const [archivedChildren, setArchivedChildren] = useState<GoalItem[]>([]);
  const [showActions, setShowActions] = useState({ open: "root", click: 1 });

  const handleChildrenGoals = async (goals: GoalItem[]) => {
    const sortedGoals = await priotizeImpossibleGoals(goals);
    setChildrenGoals([...sortedGoals.filter((goal) => goal.archived === "false")]);
    setArchivedChildren([...sortedGoals.filter((goal) => goal.archived === "true")]);
  };

  useEffect(() => {
    (showPartnerMode ? getSharedWMGoal(goalID) : getGoal(goalID)).then((parent) => setParentGoal(parent));
  }, [goalID]);

  useEffect(() => {
    (showPartnerMode ? getSharedWMChildrenGoals(goalID) : getChildrenGoals(goalID)).then((fetchedGoals) => {
      handleChildrenGoals(fetchedGoals);
    });
  }, [action, parentGoal, showAddGoal, showSuggestionModal, showChangesModal, showUpdateGoal]);

  return (
    <div className="sublist-container">
      <GoalHistory />
      <div className="sublist-content-container">
        <div className="sublist-content">
          <p className="sublist-title">{parentGoal && t(parentGoal?.title)}</p>
          <div className="sublist-list-container">
            {showAddGoal && <ConfigGoal action="Create" goal={createGoalObjectFromTags({})} />}
            <GoalsList
              goals={childrenGoals}
              showActions={showActions}
              setGoals={setChildrenGoals}
              setShowActions={setShowActions}
            />
            <ArchivedAccordion
              archivedGoals={archivedChildren}
              showActions={showActions}
              setShowActions={setShowActions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
