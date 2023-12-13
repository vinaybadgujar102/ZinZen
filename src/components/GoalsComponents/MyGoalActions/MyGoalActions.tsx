import { Modal, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useLocation, useNavigate } from "react-router-dom";

import useGoalStore from "@src/hooks/useGoalStore";
import ConfirmationModal from "@src/common/ConfirmationModal";

import {
  darkModeState,
  displayToast,
  lastAction,
  openDevMode,
  displayConfirmation,
  displayPartnerMode,
} from "@src/store";
import { GoalItem } from "@src/models/GoalItem";
import { themeState } from "@src/store/ThemeState";
import { goalsHistory } from "@src/store/GoalsState";
import { confirmAction } from "@src/Interfaces/IPopupModals";
import { convertSharedWMGoalToColab } from "@src/api/SharedWMAPI";
import { archiveThisGoal, removeThisGoal } from "@src/helpers/GoalActionHelper";

import ActionDiv from "./ActionDiv";
import "./MyGoalActions.scss";

const MyGoalActions = ({ goal, open }: { open: boolean; goal: GoalItem }) => {
  const { t } = useTranslation();
  const { handleUpdateGoal, handleShareGoal, handleConfirmation } = useGoalStore();
  const confirmActionCategory = goal.typeOfGoal === "shared" && goal.parentGoalId === "root" ? "collaboration" : "goal";

  const theme = useRecoilValue(themeState);
  const darkModeStatus = useRecoilValue(darkModeState);
  const subGoalsHistory = useRecoilValue(goalsHistory);
  const showConfirmation = useRecoilValue(displayConfirmation);
  const isPartnerGoal = useRecoilValue(displayPartnerMode);
  const setDevMode = useSetRecoilState(openDevMode);
  const setShowToast = useSetRecoilState(displayToast);
  const setLastAction = useSetRecoilState(lastAction);
  const ancestors = subGoalsHistory.map((ele) => ele.goalID);

  const [confirmationAction, setConfirmationAction] = useState<confirmAction | null>(null);

  const handleActionClick = async (action: string) => {
    if (action === "delete") {
      if (goal.title === "magic") {
        setDevMode(false);
      }
      await removeThisGoal(goal, ancestors, isPartnerGoal);
      setLastAction("goalDeleted");
    } else if (action === "archive") {
      await archiveThisGoal(goal, ancestors);
      setLastAction("goalArchived");
    } else if (action === "colabRequest") {
      await convertSharedWMGoalToColab(goal);
      window.history.back();
    } else {
      return;
    }
    window.history.go(confirmationAction ? -2 : -1);
  };

  const openConfirmationPopUp = async (action: confirmAction) => {
    const { actionCategory, actionName } = action;
    if (actionCategory === "collaboration" && showConfirmation.collaboration[actionName]) {
      handleConfirmation();
      setConfirmationAction({ ...action });
    } else if (actionCategory === "goal" && showConfirmation.goal[action.actionName]) {
      handleConfirmation();
      setConfirmationAction({ ...action });
    } else {
      await handleActionClick(actionName);
    }
  };

  const gridStyle = () => {
    let count = 1;
    if (!isPartnerGoal) count += 1;
    if ((isPartnerGoal && goal.parentGoalId === "root") || !isPartnerGoal) count += 1;
    count += 1;
    return count >= 4 ? { gridTemplateColumns: "repeat(2, 1fr)" } : { gridTemplateColumns: "1fr" };
  };

  return (
    <Modal
      open={open}
      closable={false}
      footer={null}
      centered
      width={400}
      onCancel={() => window.history.back()}
      className={`interactables-modal popupModal${darkModeStatus ? "-dark" : ""} ${
        darkModeStatus ? "dark" : "light"
      }-theme${theme[darkModeStatus ? "dark" : "light"]}`}
      maskStyle={{
        backgroundColor: darkModeStatus ? "rgba(0, 0, 0, 0.50)" : "rgba(87, 87, 87, 0.4)",
      }}
    >
      <div
        style={{ textAlign: "left" }}
        className="header-title"
        onClickCapture={() => {
          handleUpdateGoal(goal.id, !!goal.timeBudget.perDay);
        }}
      >
        <p className="ordinary-element" id="title-field">
          {goal.title}
        </p>
      </div>
      <div className="grid-container" style={gridStyle()}>
        {confirmationAction && <ConfirmationModal action={confirmationAction} handleClick={handleActionClick} />}
        <div
          className="goal-action shareOptions-btn"
          onClickCapture={async (e) => {
            e.stopPropagation();
            await openConfirmationPopUp({ actionCategory: confirmActionCategory, actionName: "delete" });
          }}
        >
          <ActionDiv label={t("Delete")} icon="Delete" />
        </div>
        {!isPartnerGoal && (
          <div
            className="goal-action shareOptions-btn"
            onClickCapture={async (e) => {
              e.stopPropagation();
              await openConfirmationPopUp({ actionCategory: confirmActionCategory, actionName: "archive" });
            }}
          >
            <ActionDiv label={t("Done")} icon="Correct" />
          </div>
        )}
        {((isPartnerGoal && goal.parentGoalId === "root") || !isPartnerGoal) && (
          <div
            className="goal-action shareOptions-btn"
            onClickCapture={async (e) => {
              e.stopPropagation();
              if (!isPartnerGoal) {
                handleShareGoal(goal);
              } else {
                await openConfirmationPopUp({ actionCategory: "collaboration", actionName: "colabRequest" });
              }
            }}
          >
            <ActionDiv
              label={t(isPartnerGoal ? "Collaborate" : "Share")}
              icon={isPartnerGoal ? "Collaborate" : "SingleAvatar"}
            />
          </div>
        )}
        <div
          className="goal-action shareOptions-btn"
          onClickCapture={() => {
            handleUpdateGoal(goal.id, !!goal.timeBudget.perDay);
          }}
        >
          <ActionDiv label={t("Edit")} icon="Edit" />
        </div>
      </div>
    </Modal>
  );
};

export default MyGoalActions;
