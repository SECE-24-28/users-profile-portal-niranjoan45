export const typeDefs = `#graphql
  type Student {
    id: ID!
    name: String!
    email: String!
    phone: String
    course: String
    profileImage: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    email: String!
  }

  type Query {
    students: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    addStudent(name: String!, email: String!, phone: String, course: String): Student!
    updateStudent(id: ID!, name: String, email: String, phone: String, course: String, profileImage: String): Student!
    deleteStudent(id: ID!): Boolean!
  }
`;
