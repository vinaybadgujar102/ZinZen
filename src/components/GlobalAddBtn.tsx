import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

import GlobalAddIcon from "@assets/images/globalAdd.svg";
import correct from "@assets/images/correct.svg";
import { themeSelectionMode } from "@src/store/ThemeState";

import useGoalStore from "@src/hooks/useGoalStore";
import useFeelingStore from "@src/hooks/useFeelingStore";
import Backdrop from "@src/common/Backdrop";

import "./index.scss";

interface AdGoalOptionsProps {
  goalType: "Budget" | "Goal";
  bottom: number;
}

const AddGoalOptions: React.FC<AdGoalOptionsProps> = ({ goalType, bottom }) => {
  const { handleAddGoal } = useGoalStore();

  return (
    <button
      type="button"
      className="add-goal-pill-btn"
      style={{ right: 29, bottom }}
      onClick={(e) => {
        e.stopPropagation();
        handleAddGoal(goalType);
      }}
    >
      <span style={{ paddingLeft: 5 }}>{goalType}</span>
      <span className="goal-btn-circle">
        <img
          style={{ padding: "2px 0 0 0 !important", filter: "brightness(0) invert(1)" }}
          src={GlobalAddIcon}
          alt="add goal"
        />
      </span>
    </button>
  );
};

const GlobalAddBtn = ({ add }: { add: string }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { handleAddFeeling } = useFeelingStore();

  const themeSelection = useRecoilValue(themeSelectionMode);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (themeSelection) {
      window.history.back();
    } else if (add === "myGoals" || state.displayPartnerMode) {
      navigate("/MyGoals", { state: { displayAddGoalOptions: true } });
    } else if (add === "myJournal") {
      handleAddFeeling();
    }
  };
  if (state?.displayAddGoalOptions) {
    return (
      <>
        <Backdrop
          opacity={0.5}
          onClick={() => {
            window.history.back();
          }}
        />
        <AddGoalOptions goalType="Budget" bottom={144} />
        <AddGoalOptions goalType="Goal" bottom={74} />
      </>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        handleClick(e);
      }}
      className="global-addBtn"
    >
      <img
        style={{ padding: "2px 0 0 0 !important", filter: "brightness(0) invert(1)" }}
        src={themeSelection ? correct : GlobalAddIcon}
        alt="add goal | add feeling | add group"
      />
    </button>
  );
};

export default GlobalAddBtn;
