import pandas as pd
import datetime

prj_2023 = pd.read_excel("./files/2023 Projects.xlsx", sheet_name="2023_Summary")
new_header = prj_2023.iloc[13].copy()
prj_2023 = prj_2023.iloc[14:].reset_index(drop=True)
prj_2023.columns = new_header

prj_with_visits = prj_2023[prj_2023['NO. OF REQUIRED VISIT'] > 0]

today = datetime.datetime.today()

visit_bool = prj_with_visits["1st Visit"] >= today
for visit_num in ["2nd Visit", "3rd Visit", "4th Visit"]:
    # print(visit_num)
    temp_bool = prj_with_visits[visit_num] >= today
    visit_bool = visit_bool | temp_bool

upcoming_prj_with_warranty = prj_with_visits[visit_bool].copy()

next_visit_prj = pd.DataFrame()
# global next_visit_prj


def add_to_next_visit_prj(row):
    global next_visit_prj
    for i in ["1st Visit", "2nd Visit", "3rd Visit", "4th Visit"]:
        if row[i] >= today:
            if row[i] >= (today + datetime.timedelta(days=14)):
                break

            temp_df = pd.DataFrame({
                "CODE": [row["CODE"]],
                "NAME": [row["COMPANY NAME2"]],
                "PROJECT_TITLE": [row["PROJECT TITLE"]],
                "POIC": [row["ASSIGNED TECH"]],
                "DATE": [f"{row[i].strftime("%m/%d/%Y")}"],
                "VISIT_NUMBER": [f"{i}"]
            })
            next_visit_prj = pd.concat([next_visit_prj, temp_df]).reset_index(drop=True)
            break


upcoming_prj_with_warranty.apply(lambda row: add_to_next_visit_prj(row), axis=1)

print(next_visit_prj)

next_visit_prj.to_json("./files/next_visits.json", orient="records")
