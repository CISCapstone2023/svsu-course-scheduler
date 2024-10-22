//NextJS
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

//React
import { useCallback } from "react";

//React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";

//React DaisyUI
import { Card, Input, Select } from "react-daisyui";

//Schema and API (local)
import { signUpSchema, type ISignUp } from "src/validation/auth";
import { api } from "src/utils/api";

const SignUp: NextPage = () => {
  //Router for sending the client to other pages
  const router = useRouter();

  //Form for handing the signup process
  const { register, handleSubmit, formState, setError } = useForm<ISignUp>({
    mode: "onBlur",
    resolver: zodResolver(signUpSchema),
  });

  /**
   * Sign Up Mutation
   *
   * When we want to send a request back to the server we use the "api"
   * that in the 'utils' folder. This provides a list of remote procedure calls
   * or functions which can be made on the backend and called on the
   * front end to either query data (lists) or mutate/change data like adding/updating/deleting
   *
   * This mutation grabs the signUp from the "auth" router, which can be called
   * to update/add new data hence the useMutation hook.
   *
   * Now this request requires ASYNC (which honestly most will probably)
   * but this allows for us to wait for the response from the server to
   * either allow the user to know if the information is already being used
   * or if not redirect the user back to the home screen as the account was created
   * successfully
   *
   *
   * ASK: Do we want to instead, auto login the new user after creation?
   *
   */
  const { mutateAsync } = api.auth.signUp.useMutation();

  const onSubmit = useCallback(
    async (data: ISignUp) => {
      const result = await mutateAsync(data);
      if (result.status === 201) {
        router.push("/");
      } else if ((result.status = 409)) {
        if (result.message.toLowerCase().includes("email")) {
          setError("email", { message: result.message });
        }
      }
    },
    [mutateAsync, router]
  );

  const allDepartments = api.department.getAllDepartmentsSelect.useQuery();

  return (
    <div>
      <Head>
        <title>SVSU Course Scheduler | Sign Up</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <main>
        <form
          className="flex h-screen w-full items-center justify-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Card className="w-96 bg-base-100 shadow-xl">
            <Card.Body className="card-body">
              <h2 className="card-title">Create an account!</h2>
              <Input
                type="text"
                color={
                  formState.errors.username
                    ? "error"
                    : formState.touchedFields.username
                    ? "success"
                    : "primary"
                }
                placeholder="Type your username..."
                className="my-2 w-full"
                {...register("username")}
              />
              <ErrorMessage
                errors={formState.errors}
                name="username"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <Select
                className="mt-2"
                placeholder="Department"
                {...register("department")}
              >
                <Select.Option value="">Select a department</Select.Option>
                <>
                  {allDepartments.data?.result.map((department, i) => {
                    return (
                      <Select.Option key={i} value={department.name}>
                        {department.name}
                      </Select.Option>
                    );
                  })}
                  ;
                </>
              </Select>

              <ErrorMessage
                errors={formState.errors}
                name="department"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <Input
                type="email"
                color={
                  formState.errors.email
                    ? "error"
                    : formState.touchedFields.email
                    ? "success"
                    : "primary"
                }
                placeholder="Type your email..."
                {...register("email")}
              />
              <ErrorMessage
                errors={formState.errors}
                name="email"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <Input
                type="password"
                color={
                  formState.errors.password
                    ? "error"
                    : formState.touchedFields.password
                    ? "success"
                    : "primary"
                }
                placeholder="Type your password..."
                className="my-2"
                {...register("password")}
              />
              <ErrorMessage
                errors={formState.errors}
                name="password"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <Card.Actions className="items-center justify-between">
                <Link href="/" className="link">
                  Go to login
                </Link>
                <button className="btn-secondary btn" type="submit">
                  Sign Up
                </button>
              </Card.Actions>
            </Card.Body>
          </Card>
        </form>
      </main>
    </div>
  );
};

//Export the NextPage so NextJS can see the page
export default SignUp;
