import { gql } from "@apollo/client";
import type { CreativeProject } from "../types";

const CREATIVE_PROJECT_FIELDS = gql`
  fragment CreativeProjectFields on CreativeProject {
    id
    title
    description
    startYear
    startMonth
    lyrics
    creationMethod
    links {
      id
      platform
      url
      label
      sortOrder
    }
    createdAt
    updatedAt
  }
`;

export const MY_CREATIVE_PROJECTS_QUERY = gql`
  ${CREATIVE_PROJECT_FIELDS}
  query MyCreativeProjects {
    myCreativeProjects {
      ...CreativeProjectFields
    }
  }
`;

export const CREATE_CREATIVE_PROJECT_MUTATION = gql`
  ${CREATIVE_PROJECT_FIELDS}
  mutation CreateCreativeProject($input: CreateCreativeProjectInput!) {
    createCreativeProject(input: $input) {
      ...CreativeProjectFields
    }
  }
`;

export const UPDATE_CREATIVE_PROJECT_MUTATION = gql`
  ${CREATIVE_PROJECT_FIELDS}
  mutation UpdateCreativeProject($id: ID!, $input: UpdateCreativeProjectInput!) {
    updateCreativeProject(id: $id, input: $input) {
      ...CreativeProjectFields
    }
  }
`;

export const DELETE_CREATIVE_PROJECT_MUTATION = gql`
  mutation DeleteCreativeProject($id: ID!) {
    deleteCreativeProject(id: $id)
  }
`;

export type MyCreativeProjectsData = {
  myCreativeProjects: CreativeProject[];
};

export type CreateCreativeProjectData = {
  createCreativeProject: CreativeProject;
};

export type UpdateCreativeProjectData = {
  updateCreativeProject: CreativeProject;
};

export type DeleteCreativeProjectData = {
  deleteCreativeProject: boolean;
};

export type CreateCreativeProjectVariables = {
  input: {
    title: string;
    description?: string;
    startYear: number;
    startMonth: number;
    lyrics?: string;
    creationMethod?: string;
    links?: Array<{
      platform: string;
      url: string;
      label?: string;
      sortOrder?: number;
    }>;
  };
};

export type UpdateCreativeProjectVariables = {
  id: string;
  input: {
    title?: string;
    description?: string;
    startYear?: number;
    startMonth?: number;
    lyrics?: string;
    creationMethod?: string;
    links?: Array<{
      platform: string;
      url: string;
      label?: string;
      sortOrder?: number;
    }>;
  };
};

export type DeleteCreativeProjectVariables = {
  id: string;
};
