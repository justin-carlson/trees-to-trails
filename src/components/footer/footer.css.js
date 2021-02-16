import styled from 'styled-components';

export const Container = styled.nav`
  ul {
    display: flex;
    list-style: none;
    padding: 0 4rem;

    li {
      text-transform: uppercase;
      font-size: 1.3rem;

      & + li {
        margin-left: 2rem;
      }
    }

    svg {
        width: 24px;
        height: 24px;
        margin: 1rem .25rem;
    }
  }
`;
