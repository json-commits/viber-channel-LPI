import pandas as pd
import datetime

today = datetime.datetime.today()


def process_prj_df(prj_df):
    new_header = prj_df.iloc[13].copy()
    prj_df = prj_df.iloc[14:].reset_index(drop=True)
    prj_df.columns = new_header
    return prj_df


def extract_upcoming_prj_with_warranty(prj_df):
    prj_with_visits = prj_df[prj_df['NO. OF REQUIRED VISIT'] > 0]
    visit_bool = prj_with_visits["1st Visit"] >= today
    for visit_num in ["2nd Visit", "3rd Visit", "4th Visit"]:
        # print(visit_num)
        temp_bool = prj_with_visits[visit_num] >= today
        visit_bool = visit_bool | temp_bool

    upcoming_prj_with_warranty = prj_with_visits[visit_bool].copy()
    return upcoming_prj_with_warranty


prj_2023 = pd.read_excel("./files/2023 Projects.xlsx", sheet_name="2023_Summary")
prj_2023 = process_prj_df(prj_2023)
upcoming_prj_2023 = extract_upcoming_prj_with_warranty(prj_2023)

prj_2024 = pd.read_excel("./files/2024 Projects.xlsx", sheet_name="2024_Summary")
prj_2024 = process_prj_df(prj_2024)
upcoming_prj_2024 = extract_upcoming_prj_with_warranty(prj_2024)

next_visit_prj = pd.DataFrame()


def add_to_next_visit_prj(row):
    global next_visit_prj
    for i in ["1st Visit", "2nd Visit", "3rd Visit", "4th Visit"]:
        # print(f'{row[i]} >= {today + datetime.timedelta(days=0)} ; {row[i] >= today}')
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


upcoming_prj_2023.apply(lambda row: add_to_next_visit_prj(row), axis=1)
upcoming_prj_2024.apply(lambda row: add_to_next_visit_prj(row), axis=1)

next_visit_prj.to_json("./files/next_visits.json", orient="records")
