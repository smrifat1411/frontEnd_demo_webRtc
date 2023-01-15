import React from "react";
import SectionTitle from "@reusecore/SectionTitle";
import GenerateOwnRoom from "@components/user/GenerateOwnRoom";
import MainContentLayout from "@reusecore/Layout/MainContentLayout";

const UserContent = () => {
  return (
    <MainContentLayout>
      <GenerateOwnRoom/>

      <div>
        <SectionTitle
            className="section-title-block"
            leftAlign={true}
            UniWidth="100%"
            mb={50}>
          <h2>
            <span>Your rooms</span>
          </h2>
        </SectionTitle>

        <div>To see your rooms, please log in first.</div>
      </div>
    </MainContentLayout>
  );
};

export default UserContent;
